---
title: "ECS 架构实战：从 OOP 到数据导向设计"
date: 2026-05-09
draft: false
summary: "通过一个完整的案例，演示如何将传统面向对象的游戏架构重构为 ECS，理解数据导向设计的核心思想。"
---

![ECS 架构示意图](https://picsum.photos/seed/ecs/800/400)

面向对象编程统治了游戏开发二十年，但 DOTS 背后的数据导向设计（Data-Oriented Design）正在改变这个局面。这篇文章通过一个伤害系统的重构案例，展示 ECS 的核心思考方式。

## 传统的 OOP 伤害系统

```csharp
public abstract class Damageable : MonoBehaviour
{
    public float health;
    public float armor;
    
    public virtual void TakeDamage(float amount, DamageType type)
    {
        float finalDamage = CalculateDamage(amount, type, armor);
        health -= finalDamage;
        
        if (health <= 0)
            Die();
    }
    
    protected abstract void Die();
}

public class Enemy : Damageable
{
    public float expReward;
    
    protected override void Die()
    {
        // 掉落经验、播放动画、清理 GameObject
        EventBus.Raise(new EnemyDiedEvent { exp = expReward });
        GetComponent<Animator>().SetTrigger("Death");
        StartCoroutine(DestroyAfterAnimation());
    }
}
```

初看很合理，但在 10000 个 Enemy 的场景下：

1. **虚函数调用**无法被 Burst 优化
2. **引用类型堆分配**触发 GC
3. **协程**跑在主线程，每帧轮询
4. **Animator** 每个实例独立更新

这 10000 个敌人能跑 60 FPS 才怪。

## ECS 重构：数据分离

ECS 的核心思想很简单：**数据和逻辑分离**。

```csharp
// 数据：纯 struct，无逻辑
public struct HealthComponent : IComponentData
{
    public float Value;
    public float MaxValue;
}

public struct ArmorComponent : IComponentData
{
    public float Value;
}

public struct DeathTag : IComponentData { } // 标记组件
```

```csharp
// 逻辑：纯函数，无状态
[BurstCompile]
public partial struct DamageSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);
        
        foreach (var (health, armor, entity) in 
            SystemAPI.Query<RefRW<HealthComponent>, RefRO<ArmorComponent>>()
                .WithEntityAccess())
        {
            health.ValueRW.Value -= CalculateDamage(in armor.ValueRO);
            
            if (health.ValueRW.Value <= 0)
            {
                ecb.AddComponent<DeathTag>(entity);
            }
        }
        
        ecb.Playback(state.EntityManager);
    }
}
```

这步重构后，伤害系统可以 Burst 编译为原生代码，不再有虚函数调用、不再有 GC。

## 架构对比

| 维度 | OOP (MonoBehaviour) | ECS |
|------|---------------------|-----|
| 数据布局 | 堆上散列 | 连续内存块 |
| 方法调用 | 虚函数 | 静态函数 |
| GC 压力 | 高（每个对象分配） | 零（struct + NativeContainer） |
| 并行化 | 困难（对象间引用） | 自然（组件无关） |
| 调试 | 简单（Inspector 直接看） | 需要专门工具（Entity Debugger） |
| 学习曲线 | 低 | 高 |

## 什么时候迁移到 ECS

不是所有项目都需要。判断标准：

> 如果 MonoBehaviour 版本在目标设备上稳定 60 FPS，就别动。ECS 的收益在 **规模**——当实体数量到达万级、十万级时，它才是正确选择。

对于中小型项目，**Job System + Burst** 的性价比远高于全量 ECS 迁移。
