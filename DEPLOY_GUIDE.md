# Super AI Video 上线部署完整指南

## 阶段一：获取API密钥（约10分钟）

### 推荐：Fal.ai（最简单快速）

**Step 1: 注册账号**
1. 打开 https://fal.ai
2. 点击 "Get Started" 或 "Sign Up"
3. 使用GitHub或Google账号登录

**Step 2: 获取API Key**
1. 登录后进入 Dashboard
2. 点击左侧菜单 "API Keys"
3. 点击 "Create New Key"
4. 复制生成的密钥（格式类似：fal_live_xxxxxxxx）

**Step 3: 配置到网站**
1. 打开 `script.js` 文件
2. 找到第15行：`FAL: { KEY: ''`
3. 填入你的密钥：`FAL: { KEY: 'fal_live_你的密钥'`
4. 设置 `USE_MOCK: false`
5. 保存文件

---

## 阶段二：接入支付系统（约20分钟）

### 方案A：Stripe（国际支付，推荐）

**Step 1: 注册Stripe账号**
1. 访问 https://stripe.com
2. 注册账号（需要公司信息或个人身份）
3. 验证邮箱

**Step 2: 获取API密钥**
1. 进入 Dashboard → Developers → API Keys
2. 复制 "Publishable key"（pk_live_开头）
3. 复制 "Secret key"（sk_live_开头）

**Step 3: 添加Stripe支付代码**

在 `index.html` 的 `</body>` 前添加：
```html
<script src="https://js.stripe.com/v3/"></script>
```

在 `script.js` 中添加Stripe配置：
```javascript
const STRIPE_CONFIG = {
    PUBLISHABLE_KEY: 'pk_live_你的密钥',
    SECRET_KEY: 'sk_live_你的密钥',
    PRICES: {
        starter: 'price_xxx',  // 在Stripe后台创建价格
        pro: 'price_xxx',
        enterprise: 'price_xxx'
    }
};
```

### 方案B：支付宝（国内用户）

**Step 1: 注册支付宝开放平台**
1. 访问 https://open.alipay.com
2. 用企业资质注册
3. 创建应用并签约 "电脑网站支付"

**Step 2: 获取密钥**
1. 进入应用详情
2. 在 "开发设置" 中获取 APPID
3. 生成应用私钥和公钥

---

## 阶段三：部署上线（约15分钟）

### 方案A：Vercel（推荐，免费且简单）

**Step 1: 准备代码**
```bash
# 在项目目录执行
git init
git add .
git commit -m "准备部署"
```

**Step 2: 创建GitHub仓库**
1. 访问 https://github.com/new
2. 创建新仓库（例如：ai-video-hub）
3. 按照提示推送代码：
```bash
git remote add origin https://github.com/你的用户名/ai-video-hub.git
git branch -M main
git push -u origin main
```

**Step 3: 部署到Vercel**
1. 访问 https://vercel.com
2. 用GitHub登录
3. 点击 "Add New Project"
4. 选择你的仓库
5. 点击 "Deploy"
6. 等待1-2分钟，获得 `.vercel.app` 域名

**Step 4: 绑定自定义域名（可选）**
1. 在Vercel项目设置中找到 "Domains"
2. 添加你的域名
3. 按照提示配置DNS

### 方案B：GitHub Pages（完全免费）

**Step 1: 推送代码到GitHub**
（同上）

**Step 2: 启用GitHub Pages**
1. 进入GitHub仓库 → Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main"，文件夹选 "/root"
4. 点击 Save
5. 等待几分钟，访问 `https://你的用户名.github.io/仓库名`

### 方案C：腾讯云/阿里云（国内服务器）

**Step 1: 购买服务器**
1. 腾讯云/阿里云购买轻量应用服务器（约60元/年）
2. 选择宝塔面板镜像

**Step 2: 上传代码**
1. 登录宝塔面板
2. 进入文件管理器
3. 上传代码到 `/www/wwwroot/你的网站目录`

**Step 3: 配置域名**
1. 在宝塔添加站点
2. 绑定你的域名
3. 配置SSL证书

---

## 配置检查清单

### API配置
- [ ] Fal.ai API Key 已获取并填入
- [ ] `USE_MOCK` 设置为 `false`
- [ ] 测试生成一个视频

### 支付配置
- [ ] Stripe/支付宝账号已注册
- [ ] API密钥已配置
- [ ] 价格方案已在支付后台设置

### 部署检查
- [ ] 代码已推送到GitHub
- [ ] 网站可以正常访问
- [ ] 生成、登录、支付功能测试通过
- [ ] 手机端显示正常

---

## 费用预估

| 项目 | 费用 | 说明 |
|------|------|------|
| Fal.ai API | $0.02-0.05/视频 | 按生成时长计费 |
| Vercel部署 | 免费 | 免费额度足够 |
| 域名 | ¥50-100/年 | 推荐 .com/.cn |
| Stripe手续费 | 2.9%+$0.3/笔 | 国际支付 |
| 支付宝手续费 | 0.6% | 国内支付 |

---

## 常见问题

**Q: 为什么视频生成这么慢？**
A: 首次生成需要加载模型，大概30-60秒。后续生成会快很多。

**Q: 如何降低成本？**
A: 
1. 使用缓存，相同提示词直接返回结果
2. 限制免费用户生成时长
3. 使用性价比更高的模型

**Q: 如何处理并发？**
A: Fal.ai和Replicate都支持队列，不需要额外处理。

---

## 下一步优化建议

1. 添加Google Analytics追踪转化
2. 接入邮件服务（SendGrid）发送注册/支付通知
3. 添加用户视频历史记录页面
4. 集成更多AI模型供用户选择
5. 添加推荐系统，根据用户喜好推荐提示词
