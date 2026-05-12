---
title: "深入 SRP：构建自定义渲染管线"
date: 2026-05-10
draft: false
summary: "从零理解 Scriptable Render Pipeline 的架构设计，实现自定义渲染 Pass，掌握剔除、绘制与后处理的完整流程。"
cover: "https://picsum.photos/seed/srp/800/400"
tags: ["Unity", "SRP", "Rendering"]
---

Unity 的可编程渲染管线（SRP）是近年来最重要的架构变革之一。它不是换个 API 那么简单——它把渲染的控制权从引擎黑盒交还给了开发者。

## 为什么需要理解 SRP

内置渲染管线的问题是：你只能通过有限的开关和回调来影响渲染，而渲染顺序、Pass 组织、资源绑定这些核心决策全在黑盒里。项目规模越大，这种失控感越强。

SRP 的核心理念是：**渲染不再是一组配置，而是一段代码**。

## SRP 的核心架构

```
Camera → Culling → Filtering → Drawing → PostProcess
   │         │          │           │
   └─ CullingResults ──┘           │
                                   │
                          ScriptableRenderContext
```

每一个环节你都可以介入：

```csharp
public class CustomRenderPipeline : RenderPipeline
{
    protected override void Render(ScriptableRenderContext context, Camera[] cameras)
    {
        foreach (var camera in cameras)
        {
            // 1. 设置摄像机矩阵
            context.SetupCameraProperties(camera);
            
            // 2. 执行剔除
            if (!camera.TryGetCullingParameters(out var cullingParams))
                continue;
            var cullingResults = context.Cull(ref cullingParams);
            
            // 3. 配置绘制对象
            var drawingSettings = CreateDrawingSettings(camera, cullingResults);
            var filteringSettings = new FilteringSettings(RenderQueueRange.all);
            
            // 4. 绘制几何体
            context.DrawRenderers(cullingResults, ref drawingSettings, ref filteringSettings);
            
            // 5. 天空盒
            context.DrawSkybox(camera);
            
            // 6. 提交命令
            context.Submit();
        }
    }
}
```

## 实战：自定义透明物体渲染 Pass

默认的透明物体排序基于物体中心距离，这在某些场景下不够精确。来看一个自定义的排序方案：

```csharp
private void RenderTransparentObjects(
    ScriptableRenderContext context, 
    Camera camera, 
    CullingResults cullingResults)
{
    var sortingCriteria = SortingCriteria.CommonTransparent 
                        | SortingCriteria.SortByMaterial;
    
    var drawingSettings = new DrawingSettings(
        new ShaderTagId("TransparentSort"), 
        new SortingSettings(camera) { criteria = sortingCriteria }
    );
    
    drawingSettings.SetShaderPassName(1, new ShaderTagId("SRPDefaultUnlit"));
    
    var filteringSettings = new FilteringSettings(
        RenderQueueRange.transparent, 
        layerMask: camera.cullingMask
    );
    
    // 执行绘制
    context.DrawRenderers(cullingResults, ref drawingSettings, ref filteringSettings);
}
```

关键点：
- `SortingCriteria.SortByMaterial` 能显著减少 SetPass Call，降低材质切换开销
- `FilteringSettings` 的 `layerMask` 让你在 SRP 层做 Layer 剔除而不是依赖 Camera 设置

## CommandBuffer：控制 GPU 命令

SRP 真正强大的是 CommandBuffer。它不是「辅助工具」，而是你与 GPU 对话的接口：

```csharp
var cmd = CommandBufferPool.Get("CustomBlit");

// 获取临时 RT
int tempRT = Shader.PropertyToID("_TempRT");
cmd.GetTemporaryRT(tempRT, camera.pixelWidth, camera.pixelHeight, 0, FilterMode.Bilinear);

// Blit 到临时纹理
cmd.Blit(BuiltinRenderTextureType.CameraTarget, tempRT);

// 释放
cmd.ReleaseTemporaryRT(tempRT);

context.ExecuteCommandBuffer(cmd);
CommandBufferPool.Release(cmd);
```

## 性能考量

自定义 SRP 不等于高性能。写不好反而比内置管线更慢。几个铁律：

1. **CommandBuffer 复用** —— 用 `CommandBufferPool` 而不是 `new CommandBuffer()`
2. **减少 context.ExecuteCommandBuffer 调用次数** —— 批量提交
3. **合理使用 SRPBatcher** —— 确保 Shader 使用 `CBUFFER_START(UnityPerMaterial)` 宏
4. **Frame Debugger 是你的朋友** —— SRP 下每个 Draw Call 的来源都可以追踪

## 什么时候不值得自定义 SRP

如果你做的事情 URP 已经提供了（Forward Renderer + Renderer Feature），先别急着造轮子。自定义 SRP 的维护成本需要整个团队承受。适合的场景：

- 有特殊渲染排序需求（如像素级排序的透明物体）
- 需要极度精细的 Draw Call 控制（移动端低配优化）
- 项目有专门的 TA/Tech Artist 团队维护管线

在大多数商业项目中，**在 URP 基础上扩展 Renderer Feature** 是性价比最高的选择。

---

下一篇文章将深入 DOTS + Job System，看看如何在不改渲染管线的前提下，把 CPU 性能提升一个数量级。
