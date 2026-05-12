---
title: "博客样式展示：图片、表格与排版测试"
date: 2026-05-08
draft: false
summary: "一篇展示博客所有排版能力的文章——图片混排、代码高亮、表格、引用、列表。"
---

这篇文章覆盖了技术博客中常见的排版元素，作为样式参考。

## 图片混排

Shuriken 粒子系统是 Unity 中最常用的特效组件，下面是它的主面板截图：

![Unity Shuriken Particle System](https://picsum.photos/seed/unity/800/400)

图片会自动适应内容宽度，上方为 Shuriken 粒子系统主面板。

### 图文并排示意

在实际开发中，模型的三角面数量直接影响渲染性能。左边是 12 万面的原始扫描模型，右边是优化后仅 2.3 万面的低模——肉眼几乎看不出差异。

![高模与低模对比](https://picsum.photos/seed/model1/380/240)
![优化后的低模](https://picsum.photos/seed/model2/380/240)

两张图并排时，能直观对比优化前后的差异。

## 代码高亮

C# 代码块自动语法高亮：

```csharp
public class ObjectPool<T> where T : Component
{
    private readonly Queue<T> pool = new Queue<T>();
    private readonly T prefab;
    private readonly Transform parent;
    
    public ObjectPool(T prefab, int initialSize, Transform parent)
    {
        this.prefab = prefab;
        this.parent = parent;
        
        for (int i = 0; i < initialSize; i++)
        {
            var obj = Create();
            pool.Enqueue(obj);
        }
    }
    
    public T Get()
    {
        var obj = pool.Count > 0 ? pool.Dequeue() : Create();
        obj.gameObject.SetActive(true);
        return obj;
    }
    
    public void Return(T obj)
    {
        obj.gameObject.SetActive(false);
        pool.Enqueue(obj);
    }
    
    private T Create() => Object.Instantiate(prefab, parent);
}
```

Shader 代码同样支持：

```hlsl
half4 FragRimLight(v2f i) : SV_Target
{
    half3 viewDir = normalize(i.worldViewDir);
    half3 normal = normalize(i.worldNormal);
    
    half NdotV = 1.0 - saturate(dot(normal, viewDir));
    half rim = pow(NdotV, _RimPower) * _RimIntensity;
    
    half4 texColor = tex2D(_MainTex, i.uv);
    half4 finalColor = texColor + rim * _RimColor;
    
    return finalColor;
}
```

## 性能数据表格

DOTS Job System 在不同实体数量下的性能表现：

| 实体数量 | MonoBehaviour | Job System | + Burst | + SoA 布局 |
|----------|---------------|------------|---------|-----------|
| 1,000 | 3.2ms | 0.5ms | 0.2ms | 0.1ms |
| 5,000 | 16.8ms | 2.1ms | 0.9ms | 0.5ms |
| 10,000 | 32.0ms | 4.2ms | 1.8ms | 1.1ms |
| 50,000 | 158ms | 22ms | 9.5ms | 5.8ms |
| 100,000 | OOM | 46ms | 19ms | 11.6ms |

## 引用

> 性能优化的第一原则：**不要优化。** 在确认瓶颈之前，所有优化都是浪费时间。先 Profiling，再谈优化。
> 
> 性能优化的第二原则：**还是不要优化。** 等你真的确认了瓶颈再说。

—— Michael Abrash，《Graphics Programming Black Book》

> DOTS 不是银弹。如果你的项目不做性能优化也能跑 60 FPS，那就不要用 DOTS。学习成本、调试难度、工具链不成熟——这些代价需要真实的性能需求来支撑。

## 列表嵌套

### 渲染管线选择决策树

1. **分析项目需求**
   - 移动端还是主机/PC？
   - 是否需要特殊渲染效果？
   - 包体大小限制？
2. **评估团队能力**
   - 是否有 TA 能维护自定义 Shader？
   - 团队对 SRP 的熟悉程度？
3. **选择方案**
   - 移动端轻量级 → URP
   - 主机/PC 高品质 → HDRP
   - 有深度定制需求 → 自定义 SRP
   - 快速原型或小项目 → 内置管线（不推荐新项目）

完整的技术栈组合：

- **引擎：** Unity 2022 LTS / Unity 6
- **语言：** C# 9.0、HLSL、ShaderLab
- **架构：** ECS + Job System + Burst
- **渲染：** URP + 自定义 Renderer Feature
- **版本控制：** Git + Git LFS（大文件）
- **CI/CD：** GitHub Actions + Unity Build Automation

---

这篇文章本身也是一个「活」的样式测试——你可以对比每个元素在网站上的实际渲染效果。
