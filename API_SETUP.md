# AI视频生成 API 配置指南

## 快速开始

编辑 `script.js` 文件顶部的 `API_CONFIG` 对象，填入你的API密钥即可启用真实视频生成。

## 支持的API服务

### 1. Fal.ai (推荐 - 速度最快)

**获取API Key:**
1. 访问 https://fal.ai
2. 注册账号
3. 在 Dashboard 中生成 API Key

**配置:**
```javascript
FAL: {
    KEY: 'your_fal_key_here',
    MODELS: {
        WAN: 'fal-ai/wan-i2v',
        VIDEO_LDM: 'fal-ai/video-ldm'
    }
}
```

### 2. Replicate

**获取API Token:**
1. 访问 https://replicate.com
2. 用GitHub账号登录
3. 在 Settings > API tokens 中创建token

**配置:**
```javascript
REPLICATE: {
    TOKEN: 'your_replicate_token_here',
    MODELS: {
        WAN: 'wavespeedai/wan-2.1-i2v-480p',
        COGVIDEO: 'thudm/cogvideox-5b',
        STABLE_VIDEO: 'stability-ai/stable-video-diffusion'
    }
}
```

**支持的模型:**
- Wan 2.1 - 最新的开源视频生成模型，效果优秀
- CogVideoX - 智谱开源模型，支持长视频
- Stable Video Diffusion - Stability AI出品

### 3. Runway ML (质量最佳)

**获取API Key:**
1. 访问 https://runwayml.com
2. 注册企业账号
3. 申请API访问权限

**配置:**
```javascript
RUNWAY: {
    KEY: 'your_runway_key_here',
    ENDPOINT: 'https://api.runwayml.com/v1'
}
```

## 费用参考

| 服务 | 免费额度 | 付费价格 | 特点 |
|------|---------|---------|------|
| Fal.ai | 注册送$10 | ~$0.02-0.05/秒 | 速度最快 |
| Replicate | 无 | ~$0.01-0.03/秒 | 模型丰富 |
| Runway | 需申请 | 企业定制 | 质量最佳 |

## 测试API连接

配置完成后，打开浏览器控制台，运行:
```javascript
console.log('API配置状态:', API_CONFIG);
```

## 常见问题

**Q: 没有API密钥怎么办?**
A: 网站默认使用模拟模式，会显示演示视频。建议先注册Fal.ai获取免费额度。

**Q: 生成失败怎么办?**
A: 检查:
1. API密钥是否正确
2. 账户是否有足够余额
3. 浏览器控制台错误信息

**Q: 如何切换回模拟模式?**
A: 设置 `USE_MOCK: true`

## 下一步优化建议

1. 接入支付系统 (Stripe/支付宝)
2. 添加用户视频历史记录页面
3. 集成更多模型 (Pika, Kling等)
4. 添加视频编辑功能
