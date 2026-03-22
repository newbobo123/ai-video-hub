// ==========================================
// Super AI Video - 核心脚本 (修复版)
// 功能：用户管理、真实视频生成（通过后端代理）
// ==========================================

// ===== API配置 =====
const API_CONFIG = {
    USE_MOCK: false,
    PROVIDER: 'replicate', // 或 'fal'
    
    REPLICATE: {
        TOKEN: '',
        MODELS: {
            WAN_T2V: 'wavespeedai/wan-2.1-t2v-480p',
            WAN_I2V: 'wavespeedai/wan-2.1-i2v-480p'
        }
    },
    
    FAL: {
        KEY: '',
        MODELS: {
            WAN_T2V: 'fal-ai/wan-t2v',
            WAN_I2V: 'fal-ai/wan-i2v'
        }
    }
};

// 从 localStorage 加载配置
function loadApiConfig() {
    const token = localStorage.getItem('api_token');
    const provider = localStorage.getItem('api_provider') || 'replicate';
    
    if (token) {
        API_CONFIG.PROVIDER = provider;
        if (provider === 'fal') {
            API_CONFIG.FAL.KEY = token;
        } else {
            API_CONFIG.REPLICATE.TOKEN = token;
        }
        console.log(`[API] 已加载 ${provider} 配置`);
    }
}

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
    }
];

// ===== 全局状态 =====
let currentUser = null;
let currentGenMode = 'text';
let isGenerating = false;
let currentGenerationId = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    loadApiConfig();
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

// ===== 视频生成功能 (修复版) =====
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

// 检查 API 配置
function checkApiConfig() {
    const token = localStorage.getItem('api_token');
    const provider = localStorage.getItem('api_provider') || 'replicate';
    
    if (!token) {
        return {
            valid: false,
            message: '请先配置 API Key',
            action: () => window.location.href = 'settings.html'
        };
    }
    
    return {
        valid: true,
        token: token,
        provider: provider
    };
}

// 主要生成函数 (修复版 - 调用后端代理)
async function quickGenerate() {
    const prompt = document.getElementById('quickPrompt')?.value?.trim();
    
    if (!prompt) {
        showToast('请输入视频描述', 'error');
        return;
    }
    
    // 检查 API 配置
    const config = checkApiConfig();
    if (!config.valid) {
        showToast(config.message + '，正在跳转设置页面...', 'error');
        setTimeout(() => config.action(), 1500);
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
        // 调用后端 API 代理
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                style: style,
                duration: parseInt(duration),
                provider: config.provider,
                apiKey: config.token
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || data.message || '生成请求失败');
        }
        
        // 如果直接返回了视频 URL
        if (data.videoUrl) {
            handleGenerationComplete(data.videoUrl, prompt);
            return;
        }
        
        // 需要轮询
        if (data.predictionId || data.requestId) {
            currentGenerationId = {
                provider: config.provider,
                predictionId: data.predictionId,
                requestId: data.requestId,
                apiKey: config.token
            };
            
            await pollGenerationStatus(currentGenerationId, prompt);
        } else {
            throw new Error('服务器返回无效响应');
        }
        
    } catch (error) {
        hideGeneratingOverlay();
        isGenerating = false;
        console.error('生成失败:', error);
        showToast('生成失败: ' + error.message, 'error');
    }
}

// 轮询生成状态
async function pollGenerationStatus(genId, prompt) {
    const maxAttempts = 60; // 最多轮询2分钟
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000)); // 每2秒查询一次
        
        try {
            const response = await fetch('/api/check-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: genId.provider,
                    predictionId: genId.predictionId,
                    requestId: genId.requestId,
                    apiKey: genId.apiKey
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '查询状态失败');
            }
            
            if (data.status === 'completed') {
                handleGenerationComplete(data.videoUrl, prompt);
                return;
            } else if (data.status === 'failed') {
                throw new Error(data.error || '生成失败');
            }
            
            // 更新进度
            const progress = data.progress || Math.min(90, 20 + attempts * 1.5);
            updateGeneratingProgress(progress, data.logs || '生成中...', maxAttempts - attempts);
            
            attempts++;
            
        } catch (error) {
            hideGeneratingOverlay();
            isGenerating = false;
            showToast('查询生成状态失败: ' + error.message, 'error');
            return;
        }
    }
    
    // 超时
    hideGeneratingOverlay();
    isGenerating = false;
    showToast('生成超时，请稍后检查历史记录', 'error');
}

// 生成完成处理
function handleGenerationComplete(videoUrl, prompt) {
    // 扣除积分
    if (!currentUser.isPro) {
        currentUser.credits--;
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
    }
    
    // 保存历史
    saveToHistory({ 
        prompt, 
        videoUrl, 
        timestamp: Date.now(),
        provider: API_CONFIG.PROVIDER
    });
    
    hideGeneratingOverlay();
    showToast('视频生成成功！', 'success');
    
    // 显示结果
    showVideoResult(videoUrl, prompt);
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
    
    if (fill) fill.style.width = Math.min(100, Math.max(0, progress)) + '%';
    if (status) status.textContent = typeof text === 'string' ? text.substring(0, 100) : '生成中...';
    if (time) time.textContent = Math.ceil(timeLeft * 2) + '秒';
}

// 显示生成结果
function showVideoResult(videoUrl, prompt) {
    // 创建结果弹窗
    const modal = document.createElement('div');
    modal.className = 'modal modal-video active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close-btn" onclick="this.closest('.modal').remove()">&times;</span>
            <h3 style="margin-bottom: 20px;">🎉 视频生成成功！</h3>
            <div class="video-player" style="margin-bottom: 20px;">
                <video src="${videoUrl}" controls autoplay style="width: 100%; border-radius: 12px;"></video>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="color: #888; font-size: 14px; margin-bottom: 8px;">提示词：</p>
                <p style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">${escapeHtml(prompt)}</p>
            </div>
            <div class="video-actions" style="display: flex; gap: 12px; justify-content: center;">
                <a href="${videoUrl}" download class="btn-action" style="text-decoration: none;">⬇️ 下载视频</a>
                <button class="btn-action secondary" onclick="copyVideoUrl('${videoUrl}')">📋 复制链接</button>
                <button class="btn-action secondary" onclick="this.closest('.modal').remove()">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyVideoUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('视频链接已复制', 'success');
    });
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
