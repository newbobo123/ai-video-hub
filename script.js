// ==========================================
// Super AI Video - 核心脚本
// 功能：用户管理、视频生成（支持真实API）、支付、提示词库
// ==========================================

// ===== API配置 =====
// 配置已从外部文件(api-config.js)或环境变量加载
// 如需设置API密钥，请在浏览器控制台执行:
// window.API_TOKEN = '你的Replicate API Token';
// 然后刷新页面

// ===== 提示词数据库 =====
const PROMPTS_DB = [
    {
        id: 1,
        category: 'nature',
        tag: '🌿 自然风光',
        text: '壮观瀑布从悬崖倾泻而下，彩虹横跨水雾，阳光穿透云层，4K超高清，电影级画面',
        usage: '12.5k',
        rating: '98%',
        preview: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400'
    },
    {
        id: 2,
        category: 'character',
        tag: '👤 人物角色',
        text: '优雅的中国古代仕女在庭院中抚琴，花瓣飘落，水墨画风格，意境唯美，细腻光影',
        usage: '8.3k',
        rating: '96%',
        preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
    },
    {
        id: 3,
        category: 'animal',
        tag: '🐾 动物世界',
        text: '雄狮在非洲草原上奔跑，夕阳余晖，金色光芒，慢动作，史诗级画面，野生动物纪录片风格',
        usage: '15.2k',
        rating: '99%',
        preview: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400'
    },
    {
        id: 4,
        category: 'scifi',
        tag: '🚀 科幻未来',
        text: '太空站环绕地球运转，星河璀璨，宇航员舱外行走，NASA纪录片风格，超写实渲染',
        usage: '6.7k',
        rating: '94%',
        preview: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'
    },
    {
        id: 5,
        category: 'art',
        tag: '🎨 艺术创意',
        text: '梵高星空风格的城市夜景，流动的星云，旋转的柏树，印象派油画动态化，梦幻色彩',
        usage: '9.1k',
        rating: '97%',
        preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'
    },
    {
        id: 6,
        category: 'nature',
        tag: '🌿 自然风光',
        text: '樱花隧道，花瓣如雪飘落，阳光穿透花枝，日式唯美风格，4K高清，浪漫氛围',
        usage: '11.8k',
        rating: '98%',
        preview: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400'
    },
    {
        id: 7,
        category: 'animal',
        tag: '🐾 动物世界',
        text: '海豚群在海浪中跃出水面，蓝色海洋背景，阳光反射，慢动作，自然纪录片风格',
        usage: '7.4k',
        rating: '95%',
        preview: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=400'
    },
    {
        id: 8,
        category: 'character',
        tag: '👤 人物角色',
        text: '赛博朋克风格的女战士，霓虹灯光，雨中城市背景，科幻电影风格，高对比度',
        usage: '10.2k',
        rating: '97%',
        preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
    },
    {
        id: 9,
        category: 'scifi',
        tag: '🚀 科幻未来',
        text: '未来城市飞行汽车穿梭，全息广告牌，雨夜霓虹，银翼杀手风格，4K超清',
        usage: '8.9k',
        rating: '96%',
        preview: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'
    },
    {
        id: 10,
        category: 'art',
        tag: '🎨 艺术创意',
        text: '水墨画风格的山水动画，云雾缭绕，仙鹤飞翔，中国传统艺术，意境深远',
        usage: '6.3k',
        rating: '94%',
        preview: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
    },
    {
        id: 11,
        category: 'nature',
        tag: '🌿 自然风光',
        text: '极光下的冰岛瀑布，绿色极光舞动，长曝光效果，星空背景，梦幻自然',
        usage: '9.7k',
        rating: '98%',
        preview: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400'
    },
    {
        id: 12,
        category: 'animal',
        tag: '🐾 动物世界',
        text: '蝴蝶在花丛中飞舞，微距摄影，阳光穿透翅膀，彩虹色反光，自然唯美',
        usage: '5.8k',
        rating: '93%',
        preview: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400'
    }
];

// ===== 工具数据库 =====
const TOOLS_DB = [
    {
        id: 1,
        name: "Runway Gen-3",
        icon: "🎬",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        tags: ["文本转视频", "图像转视频"],
        desc: "目前最强的AI视频生成工具，支持文本/图像生成高质量视频，运动笔刷功能独特",
        rating: 4.9,
        price: "$28/月",
        priceType: "paid",
        url: "https://runwayml.com"
    },
    {
        id: 2,
        name: "Haiper",
        icon: "🎭",
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        tags: ["文本转视频", "图像转视频", "免费"],
        desc: "免费高质量视频生成，支持2秒高清视频，每日有免费额度",
        rating: 4.7,
        price: "免费",
        priceType: "free",
        url: "https://haiper.ai"
    },
    {
        id: 3,
        name: "Luma Dream Machine",
        icon: "🌊",
        color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        tags: ["文本转视频", "图像转视频"],
        desc: "快速生成逼真视频，物理效果出色，首帧一致性优秀",
        rating: 4.6,
        price: "$7.99/月",
        priceType: "paid",
        url: "https://lumalabs.ai"
    },
    {
        id: 4,
        name: "Kling AI",
        icon: "🎪",
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        tags: ["文本转视频", "图像转视频"],
        desc: "快手出品，支持2分钟长视频，运动幅度大，中文支持好",
        rating: 4.8,
        price: "$10/月",
        priceType: "paid",
        url: "https://klingai.com"
    },
    {
        id: 5,
        name: "Pika Labs",
        icon: "🦌",
        color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        tags: ["文本转视频", "图像转视频", "视频编辑"],
        desc: "支持扩展视频、局部重绘，风格化效果出色，社区活跃",
        rating: 4.5,
        price: "$8/月",
        priceType: "paid",
        url: "https://pika.art"
    },
    {
        id: 6,
        name: "Stable Video Diffusion",
        icon: "🎨",
        color: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
        tags: ["图像转视频", "开源"],
        desc: "Stability AI开源模型，可本地部署，4秒视频生成",
        rating: 4.3,
        price: "免费/开源",
        priceType: "free",
        url: "https://stability.ai"
    },
    {
        id: 7,
        name: "Sora",
        icon: "🌌",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        tags: ["文本转视频"],
        desc: "OpenAI出品，目前最强长视频生成，支持60秒连贯视频",
        rating: 4.9,
        price: "ChatGPT Plus",
        priceType: "paid",
        url: "https://openai.com/sora"
    },
    {
        id: 8,
        name: "HeyGen",
        icon: "👤",
        color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        tags: ["数字人", "口播视频"],
        desc: "最强AI数字人平台，支持多语言口播，适合营销视频",
        rating: 4.7,
        price: "$24/月",
        priceType: "paid",
        url: "https://heygen.com"
    },
    {
        id: 9,
        name: "D-ID",
        icon: "🗣️",
        color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        tags: ["数字人", "照片说话"],
        desc: "让照片开口说话，支持多语言和不同情绪表达",
        rating: 4.5,
        price: "$5.9/月",
        priceType: "paid",
        url: "https://d-id.com"
    },
    {
        id: 10,
        name: "CapCut",
        icon: "✂️",
        color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
        tags: ["视频编辑", "AI功能"],
        desc: "剪映国际版，内置AI文案、AI配音、智能字幕等功能",
        rating: 4.6,
        price: "免费",
        priceType: "free",
        url: "https://capcut.com"
    }
];

// ===== 全局状态 =====
let currentUser = null;
let currentGenMode = 'text';
let isGenerating = false;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    checkAuthStatus();
    renderPrompts();
    renderTools();
    startLiveUpdates();
    setupVideoAutoplay();
    setupSmoothScroll();
}

// ===== 认证功能 =====
function checkAuthStatus() {
    const savedUser = localStorage.getItem('sa_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const userSection = document.getElementById('userSection');
    const authSection = document.getElementById('authSection');
    
    if (userSection) userSection.classList.remove('hidden');
    if (authSection) authSection.style.display = 'none';
    
    const creditsEl = document.getElementById('userCredits');
    if (creditsEl && currentUser) {
        creditsEl.textContent = currentUser.credits || 5;
    }
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showToast('请填写邮箱和密码', 'error');
        return;
    }
    
    currentUser = {
        email: email,
        credits: 5,
        isPro: false,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('sa_user', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showToast('登录成功！欢迎回来', 'success');
}

function handleRegister() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    
    if (!email || !password || !confirm) {
        showToast('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    currentUser = {
        email: email,
        credits: 5,
        isPro: false,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('sa_user', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showToast('注册成功！送你5次免费生成', 'success');
}

function socialLogin(provider) {
    showToast(`${provider}登录功能开发中...`, 'info');
}

// ===== 付费功能 =====
function openPaywall() {
    const modal = document.getElementById('paywallModal');
    if (modal) modal.classList.add('active');
}

function closePaywall() {
    const modal = document.getElementById('paywallModal');
    if (modal) modal.classList.remove('active');
}

function selectPlan(plan) {
    if (!currentUser) {
        closePaywall();
        openAuthModal();
        showToast('请先登录', 'info');
        return;
    }
    
    showToast(`已选择${plan}方案，跳转支付...`, 'success');
    
    setTimeout(() => {
        currentUser.isPro = true;
        currentUser.plan = plan;
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        closePaywall();
        showToast('升级成功！享受专业版功能', 'success');
        updateUIForLoggedInUser();
    }, 1500);
}

function contactSales() {
    showToast('请联系 sales@superaivideo.com', 'info');
}

// ===== 视频生成功能 =====
function switchGenMode(mode) {
    currentGenMode = mode;
    const tabs = document.querySelectorAll('.gen-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.closest('.gen-tab').classList.add('active');
}

function usePrompt(prompt) {
    const textarea = document.getElementById('quickPrompt');
    if (textarea) {
        textarea.value = prompt;
        textarea.focus();
        showToast('提示词已填入', 'success');
    }
}

// 主要生成函数
async function quickGenerate() {
    const prompt = document.getElementById('quickPrompt')?.value?.trim();
    
    if (!prompt) {
        showToast('请输入视频描述', 'error');
        return;
    }
    
    if (!currentUser) {
        openAuthModal();
        showToast('请先登录后开始生成', 'info');
        return;
    }
    
    if (currentUser.credits <= 0 && !currentUser.isPro) {
        openPaywall();
        showToast('免费次数已用完，升级会员继续', 'info');
        return;
    }
    
    const style = document.getElementById('quickStyle')?.value || 'realistic';
    const duration = document.getElementById('quickDuration')?.value || '4';
    
    // 显示生成进度
    showGeneratingOverlay();
    isGenerating = true;
    
    try {
        let videoUrl;
        
        if (API_CONFIG.USE_MOCK) {
            videoUrl = await mockGenerate(prompt, style, duration);
        } else {
            videoUrl = await generateWithAPI(prompt, style, duration);
        }
        
        // 扣除积分
        if (!currentUser.isPro) {
            currentUser.credits--;
            localStorage.setItem('sa_user', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
        }
        
        // 保存历史
        saveToHistory({ prompt, style, duration, videoUrl, timestamp: Date.now() });
        
        hideGeneratingOverlay();
        showToast('视频生成成功！', 'success');
        
        // 显示结果
        showVideoResult(videoUrl, prompt);
        
    } catch (error) {
        hideGeneratingOverlay();
        isGenerating = false;
        console.error('生成失败:', error);
        showToast('生成失败: ' + error.message, 'error');
    }
}

// 模拟生成
function mockGenerate(prompt, style, duration) {
    return new Promise((resolve) => {
        const stages = [
            { progress: 10, text: '正在解析提示词...', time: 40 },
            { progress: 30, text: '加载AI模型中...', time: 30 },
            { progress: 50, text: '生成视频帧...', time: 20 },
            { progress: 70, text: '优化画面质量...', time: 15 },
            { progress: 90, text: '最终渲染中...', time: 5 },
            { progress: 100, text: '生成完成！', time: 0 }
        ];
        
        let currentStage = 0;
        
        const interval = setInterval(() => {
            if (currentStage < stages.length) {
                const stage = stages[currentStage];
                updateGeneratingProgress(stage.progress, stage.text, stage.time);
                currentStage++;
            } else {
                clearInterval(interval);
                const demoVideos = [
                    'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4',
                    'https://cdn.pixabay.com/video/2020/04/16/37102-412175983_large.mp4',
                    'https://cdn.pixabay.com/video/2019/10/04/27573-363527458_large.mp4'
                ];
                resolve(demoVideos[Math.floor(Math.random() * demoVideos.length)]);
            }
        }, 800);
    });
}

// 真实API生成
async function generateWithAPI(prompt, style, duration) {
    // 优先使用配置的真实API
    const useReplicate = API_CONFIG.REPLICATE.TOKEN && API_CONFIG.REPLICATE.TOKEN.length > 10;
    const useFal = API_CONFIG.FAL.KEY && API_CONFIG.FAL.KEY.length > 10;
    
    if (useFal) {
        return await generateWithFal(prompt, style, duration);
    } else if (useReplicate) {
        return await generateWithReplicate(prompt, style, duration);
    } else {
        // 没有配置API，使用模拟
        console.log('未配置真实API，使用模拟模式');
        return await mockGenerate(prompt, style, duration);
    }
}

// Fal.ai API
async function generateWithFal(prompt, style, duration) {
    updateGeneratingProgress(10, '正在连接Fal.ai服务...', 45);
    
    const response = await fetch('https://api.fal.ai/v1/video/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${API_CONFIG.FAL.KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            duration: parseInt(duration),
            style: style,
            aspect_ratio: '16:9'
        })
    });
    
    if (!response.ok) {
        throw new Error('API请求失败: ' + response.status);
    }
    
    const data = await response.json();
    
    // 轮询结果
    if (data.request_id) {
        return await pollFalResult(data.request_id);
    }
    
    return data.video_url;
}

async function pollFalResult(requestId) {
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        
        const response = await fetch(`https://api.fal.ai/v1/requests/${requestId}`, {
            headers: { 'Authorization': `Key ${API_CONFIG.FAL.KEY}` }
        });
        
        const data = await response.json();
        
        if (data.status === 'completed') {
            return data.output.video_url;
        } else if (data.status === 'failed') {
            throw new Error('生成失败: ' + data.error);
        }
        
        updateGeneratingProgress(30 + i, '生成中...', 60 - i);
    }
    
    throw new Error('生成超时');
}

// Replicate API
async function generateWithReplicate(prompt, style, duration) {
    updateGeneratingProgress(10, '正在连接Replicate...', 45);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${API_CONFIG.REPLICATE.TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: "wavespeedai/wan-2.1-i2v-480p:latest",
            input: {
                prompt: prompt,
                num_frames: parseInt(duration) * 8,
                fps: 8,
                guidance_scale: 7.5
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('API请求失败: ' + response.status);
    }
    
    const data = await response.json();
    return await pollReplicateResult(data.id);
}

async function pollReplicateResult(predictionId) {
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Token ${API_CONFIG.REPLICATE.TOKEN}` }
        });
        
        const data = await response.json();
        
        if (data.status === 'succeeded') {
            return data.output;
        } else if (data.status === 'failed') {
            throw new Error('生成失败: ' + data.error);
        }
        
        updateGeneratingProgress(30 + i * 1, data.logs || '生成中...', 60 - i);
    }
    
    throw new Error('生成超时');
}

// 生成进度显示
function showGeneratingOverlay() {
    const overlay = document.getElementById('generatingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hideGeneratingOverlay() {
    const overlay = document.getElementById('generatingOverlay');
    if (overlay) overlay.classList.remove('active');
    isGenerating = false;
}

function updateGeneratingProgress(progress, text, timeLeft) {
    const fill = document.getElementById('progressFill');
    const status = document.getElementById('generatingStatus');
    const time = document.getElementById('timeRemaining');
    
    if (fill) fill.style.width = progress + '%';
    if (status) status.textContent = text;
    if (time) time.textContent = timeLeft;
}

// 显示生成结果
function showVideoResult(videoUrl, prompt) {
    // 可以在这里添加结果显示逻辑
    console.log('生成的视频:', videoUrl);
    // 滚动到预览区
    document.getElementById('previewSection')?.scrollIntoView({ behavior: 'smooth' });
}

// ===== 提示词功能 =====
function renderPrompts(category = 'all') {
    const grid = document.getElementById('promptsGrid');
    if (!grid) return;
    
    let prompts = PROMPTS_DB;
    if (category !== 'all') {
        prompts = prompts.filter(p => p.category === category);
    }
    
    grid.innerHTML = prompts.map(prompt => `
        <div class="prompt-card-v2" data-category="${prompt.category}">
            <div class="prompt-preview" style="background-image: url('${prompt.preview}')">
                <div class="prompt-preview-overlay">
                    <button class="btn-preview-play" onclick="usePrompt('${escapeHtml(prompt.text)}')">使用此提示词</button>
                </div>
            </div>
            <div class="prompt-card-content">
                <div class="prompt-header">
                    <span class="prompt-tag">${prompt.tag}</span>
                    <button class="btn-copy" onclick="copyPrompt(this, '${escapeHtml(prompt.text)}')">
                        <span>📋</span>
                        <span>复制</span>
                    </button>
                </div>
                <p class="prompt-text-v2">${prompt.text}</p>
                <div class="prompt-stats-v2">
                    <span>🔥 ${prompt.usage}</span>
                    <span>⭐ ${prompt.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterPrompts(category) {
    document.querySelectorAll('.prompt-cat').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderPrompts(category);
}

function copyPrompt(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<span>✓</span><span>已复制</span>';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('copied');
        }, 2000);
        showToast('提示词已复制', 'success');
    });
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function loadMorePrompts() {
    showToast('更多提示词加载中...', 'info');
}

// ===== 工具功能 =====
function renderTools() {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    
    grid.innerHTML = TOOLS_DB.map(tool => `
        <div class="tool-card-v2">
            <div class="tool-card-header">
                <div class="tool-icon-v2" style="background: ${tool.color}">${tool.icon}</div>
                <div class="tool-title-v2">
                    <h4>${tool.name}</h4>
                    <div class="tool-tags-v2">
                        ${tool.tags.slice(0, 2).map(t => `<span class="tool-tag-v2">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
            <p class="tool-desc-v2">${tool.desc}</p>
            <div class="tool-card-footer">
                <div class="tool-meta">
                    <span class="tool-rating">⭐ ${tool.rating}</span>
                    <span class="tool-price-v2 ${tool.priceType}">${tool.price}</span>
                </div>
                <a href="${tool.url}" target="_blank" class="btn-tool-link">
                    访问
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                </a>
            </div>
        </div>
    `).join('');
}

// ===== 作品展示 =====
function filterShowcase(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const items = document.querySelectorAll('.showcase-item');
    items.forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
    });
}

// ===== 视频播放 =====
function playVideo(id) {
    const videos = {
        demo1: { url: 'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4', title: '火星宇航员', prompt: '宇航员在火星表面行走' },
        demo2: { url: 'https://cdn.pixabay.com/video/2020/04/16/37102-412175983_large.mp4', title: '樱花街道', prompt: '樱花飘落的日本街道' },
        demo3: { url: 'https://cdn.pixabay.com/video/2019/10/04/27573-363527458_large.mp4', title: '海底世界', prompt: '海龟在珊瑚礁中游泳' }
    };
    
    const video = videos[id];
    if (video) {
        openVideoModal(video.url, video.title, video.prompt);
    }
}

function openVideoModal(url, title, prompt) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    const titleEl = document.getElementById('videoTitle');
    const promptEl = document.getElementById('videoPrompt');
    
    if (video) {
        video.src = url;
        video.play();
    }
    if (titleEl) titleEl.textContent = title || '视频';
    if (promptEl) promptEl.textContent = prompt || '';
    if (modal) modal.classList.add('active');
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    if (video) {
        video.pause();
        video.src = '';
    }
    if (modal) modal.classList.remove('active');
}

function useThisPrompt() {
    const promptEl = document.getElementById('videoPrompt');
    if (promptEl) {
        usePrompt(promptEl.textContent);
        closeVideoModal();
    }
}

function likeVideo() {
    showToast('已点赞！', 'success');
}

function shareVideo() {
    showToast('分享链接已复制', 'success');
}

// ===== 其他功能 =====
function saveToHistory(item) {
    let history = JSON.parse(localStorage.getItem('sa_history') || '[]');
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('sa_history', JSON.stringify(history));
}

function inviteFriends() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const link = `${window.location.origin}?ref=${code}`;
    
    navigator.clipboard.writeText(link).then(() => {
        showToast('邀请链接已复制！分享给好友', 'success');
    });
}

// ===== 实时更新 =====
function startLiveUpdates() {
    setInterval(() => {
        const liveUsers = document.getElementById('liveUsers');
        if (liveUsers) {
            const current = parseInt(liveUsers.textContent.replace(/,/g, ''));
            const change = Math.floor(Math.random() * 50) - 25;
            liveUsers.textContent = Math.max(1000, current + change).toLocaleString();
        }
    }, 3000);
    
    setInterval(() => {
        const todayCount = document.getElementById('todayCount');
        if (todayCount) {
            const current = parseInt(todayCount.textContent.replace(/,/g, ''));
            todayCount.textContent = (current + Math.floor(Math.random() * 5)).toLocaleString();
        }
    }, 5000);
}

// ===== 视频自动播放 =====
function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.preview-video video');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    
    videos.forEach(video => observer.observe(video));
}

// ===== 平滑滚动 =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== Toast提示 =====
function showToast(message, type = 'info') {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== 全局事件 =====
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        if (event.target.id === 'videoModal') {
            const video = document.getElementById('modalVideo');
            if (video) {
                video.pause();
                video.src = '';
            }
        }
    }
}
