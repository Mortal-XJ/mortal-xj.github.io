---
title: "Shader 进阶：从表面着色器到自定义 HLSL"
date: 2026-05-12
draft: false
summary: "告别 Shader Graph 黑盒，深入 HLSL 编写自定义光照模型、屏幕空间效果和 GPU Instancing 优化。"
cover: "https://picsum.photos/seed/shader/800/400"
tags: ["Unity", "Shader", "HLSL", "Rendering"]
---

Shader 是图形程序员的必修课。Shader Graph 拖节点能解决 80% 的需求，但剩下的 20%——自定义光照、屏幕空间效果、极致性能优化——需要你直面 HLSL。

## 为什么 Shader Graph 不够用

一个真实的案例：项目中需要实现基于距离的透明度衰减，且衰减曲线要支持幂函数调节。Shader Graph 需要 15 个节点拼接，而 HLSL 只需要一行：

```hlsl
float attenuation = pow(saturate(1.0 - distance / maxDistance), power);
```

更重要的是：当性能成为瓶颈时，你需要知道每个节点的底层实现才能做出正确的优化决策。

## 从 Shader Graph 到 HLSL

Shader Graph 编译产物可以直接展开为 HLSL。在 Shader Graph 面板右键 → **View Generated Shader**，你会看到完整的顶点和片元着色器代码。这是最好的学习材料。

## 实战一：自定义 PBR 光照模型

Unity 默认使用 Standard PBR（Disney BSDF 的简化版）。当需要风格化渲染时，自定义光照模型是必选项：

```hlsl
// 自定义菲涅尔——让边缘光更可控
half3 CustomFresnel(half3 specColor, half3 lightDir, half3 normal, half exponent)
{
    half NdotL = saturate(dot(normal, lightDir));
    half fresnel = pow(1.0 - NdotL, exponent);
    return specColor + (1.0 - specColor) * fresnel;
}

// 各向异性高光——金属拉丝、头发
half AnisotropicSpecular(half3 halfVec, half3 tangent, half anisotropy, half roughness)
{
    half TdotH = dot(tangent, halfVec);
    half sinTH = sqrt(1.0 - TdotH * TdotH);
    half aniso = max(0.001, roughness * (1.0 + anisotropy));
    
    half exponent = TdotH / aniso;
    return exp(-(exponent * exponent)) / (aniso * sqrt(roughness));
}

half4 CustomLightingFragment(v2f i) : SV_Target
{
    half3 normal = normalize(i.worldNormal);
    half3 viewDir = normalize(i.worldViewDir);
    half3 lightDir = normalize(_MainLightPosition.xyz);
    half3 halfVec = normalize(lightDir + viewDir);
    
    // Diffuse
    half NdotL = saturate(dot(normal, lightDir));
    half3 diffuse = _BaseColor * NdotL;
    
    // Specular with custom Fresnel
    half3 specular = CustomFresnel(_SpecColor, lightDir, normal, _FresnelPower);
    
    // Optional: anisotropic
    half3 aniso = AnisotropicSpecular(halfVec, i.worldTangent, _Anisotropy, _Roughness);
    
    half3 finalColor = (diffuse + specular) * _MainLightColor.rgb + aniso;
    return half4(finalColor, 1.0);
}
```

## 实战二：屏幕空间模糊（后处理 Pass）

高效的高斯模糊需要两趟 Pass——水平 + 垂直——把 O(n²) 降到 O(2n)：

```hlsl
// Horizontal Pass
half4 FragHorizontalBlur(v2f i) : SV_Target
{
    half4 color = 0;
    half totalWeight = 0;
    
    // 9-tap Gaussian kernel, sigma=2.0
    const half weights[5] = { 0.227, 0.194, 0.122, 0.054, 0.016 };
    
    color += tex2D(_MainTex, i.uv) * weights[0];
    totalWeight += weights[0];
    
    for (int tap = 1; tap < 5; tap++)
    {
        float2 offset = float2(_BlurSize * tap, 0);
        color += tex2D(_MainTex, i.uv + offset) * weights[tap];
        color += tex2D(_MainTex, i.uv - offset) * weights[tap];
        totalWeight += weights[tap] * 2;
    }
    
    return color / totalWeight;
}
```

对应的 C# 调度代码：

```csharp
void OnRenderImage(RenderTexture src, RenderTexture dest)
{
    int width = src.width / _Downsample;
    int height = src.height / _Downsample;
    
    var tempRT = RenderTexture.GetTemporary(width, height, 0, src.format);
    
    // Horizontal
    blurMaterial.SetFloat("_BlurSize", 1.0f / width);
    Graphics.Blit(src, tempRT, blurMaterial, 0);
    
    // Vertical
    blurMaterial.SetFloat("_BlurSize", 1.0f / height);
    Graphics.Blit(tempRT, dest, blurMaterial, 1);
    
    RenderTexture.ReleaseTemporary(tempRT);
}
```

## 实战三：GPU Instancing 的正确姿势

GPU Instancing 不是勾个复选框那么简单。要让其真正生效，需要理解它的限制：

```hlsl
// 使用 UnityPerMaterial CBUFFER——这是 SRP Batcher 的兼容格式
CBUFFER_START(UnityPerMaterial)
    half4 _BaseColor;
    half _Metallic;
    half _Smoothness;
    half _FresnelPower;
    half _Anisotropy;
    half _Roughness;
CBUFFER_END
```

在 C# 端使用 `MaterialPropertyBlock` 传递逐实例数据：

```csharp
private MaterialPropertyBlock propertyBlock;

void Update()
{
    if (propertyBlock == null) propertyBlock = new MaterialPropertyBlock();
    
    for (int i = 0; i < renderers.Length; i++)
    {
        propertyBlock.SetColor("_BaseColor", colors[i]);
        renderers[i].SetPropertyBlock(propertyBlock);
    }
    // 同一材质 + 不同 PropertyBlock = GPU Instancing 生效
}
```

**检查是否真的触发了 Instancing：** Frame Debugger → 查看 Draw Call 详情，确认看到 "Draw Mesh (instanced)" 而不是 "Draw Mesh"。

## 常见坑

1. **`tex2D` 在顶点着色器中被限制** —— 需要 `#pragma target 3.0` 或使用 `tex2Dlod`
2. **SRP Batcher 与 GPU Instancing 互斥** —— 二选一，批量优先用 SRP Batcher，大量相同 Mesh 用 Instancing
3. **`_Time` 在 Burst 编译的 Job 中不可用** —— 通过 MaterialPropertyBlock 从 C# 传入时间

## 总结

| 需求 | 方案 |
|------|------|
| 标准 PBR 材质 | Standard Shader 或 Shader Graph |
| 风格化渲染 | 自定义 Shader + 自定义光照 |
| 屏幕空间特效 | 后处理 Pass + CommandBuffer |
| 大量相同物体 | GPU Instancing + MaterialPropertyBlock |
| 大量不同材质 | SRP Batcher + CBUFFER 规范 |

Shader 优化的核心思想：**尽可能让 GPU 保持忙碌，减少 CPU-GPU 同步等待。** 理解这一点，比记住一百个 API 更有用。
