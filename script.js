// ==========================================
// Super AI Video - 核心脚本 (完全修复版)
// ==========================================

// 全局状态
let currentUser = null;
let currentGenMode = 'text';
let isGenerating = false;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('[App] 初始化开始');
    initApp();
});

function initApp() {
    checkAuthStatus();
    renderPrompts();
    renderTools();
    startLiveUpdates();
    console.log('[App] 初始化完成');
}

// ===== 认证功能 =====
function checkAuthStatus() {
    try {
        const savedUser = localStorage.getItem('sa_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
        }
    } catch (e) {
        console.error('[Auth] 检查状态失败', e);
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
    console.log('[Auth] 打开登录弹窗');
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('[Auth] 找不到 authModal 元素');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab, element) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (element) element.classList.add('active');
    
    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    
    if (!email || !email.value || !password || !password.value) {
        showToast('请填写邮箱和密码', 'error');
        return;
    }
    
    currentUser = {
        email: email.value,
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
    const email = document.getElementById('registerEmail');
    const password = document.getElementById('registerPassword');
    const confirm = document.getElementById('confirmPassword');
    
    if (!email || !email.value || !password || !password.value || !confirm || !confirm.value) {
        showToast('请填写所有字段', 'error');
        return;
    }
    
    if (password.value !== confirm.value) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    currentUser = {
        email: email.value,
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
    showToast(provider + '登录功能开发中...', 'info');
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
    
    showToast('已选择' + plan + '方案，跳转支付...', 'success');
    
    setTimeout(function() {
        currentUser.isPro = true;
        currentUser.plan = plan;
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        closePaywall();
        showToast('升级成功！享受专业版功能', 'success');
        updateUIForLoggedInUser();
    }, 1500);
}

// ===== 视频生成功能 =====
function switchGenMode(mode, element) {
    currentGenMode = mode;
    const tabs = document.querySelectorAll('.gen-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    if (element) element.classList.add('active');
    
    // 切换输入区域显示
    const textSection = document.getElementById('textInputSection');
    const imageSection = document.getElementById('imageInputSection');
    
    if (mode === 'text') {
        if (textSection) textSection.classList.remove('hidden');
        if (imageSection) imageSection.classList.add('hidden');
    } else {
        if (textSection) textSection.classList.add('hidden');
        if (imageSection) imageSection.classList.remove('hidden');
    }
}

// ===== 图片上传处理 =====
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }
    
    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
        showToast('图片大小不能超过 10MB', 'error');
        return;
    }
    
    // 读取并显示图片
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('uploadedImage');
        const placeholder = document.getElementById('uploadPlaceholder');
        const changeBtn = document.getElementById('changeImageBtn');
        const uploadArea = document.querySelector('.image-upload-area');
        
        if (img) {
            img.src = e.target.result;
            img.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
        if (changeBtn) changeBtn.classList.remove('hidden');
        if (uploadArea) uploadArea.classList.add('has-image');
        
        showToast('图片上传成功', 'success');
        
        // 保存图片数据到全局变量
        window.uploadedImageData = e.target.result;
    };
    reader.readAsDataURL(file);
}

function usePrompt(prompt) {
    const textarea = document.getElementById('quickPrompt');
    const imageTextarea = document.getElementById('imagePrompt');
    
    if (currentGenMode === 'image' && imageTextarea) {
        imageTextarea.value = prompt;
        imageTextarea.focus();
    } else if (textarea) {
        textarea.value = prompt;
        textarea.focus();
    }
    showToast('提示词已填入', 'success');
}

function quickGenerate() {
    console.log('[Generate] 开始生成，模式：' + currentGenMode);
    
    let prompt = '';
    let imageData = null;
    
    if (currentGenMode === 'image') {
        // 图生视频模式
        const imagePromptEl = document.getElementById('imagePrompt');
        prompt = imagePromptEl ? imagePromptEl.value.trim() : '';
        
        if (!window.uploadedImageData) {
            showToast('请先上传图片', 'error');
            return;
        }
        imageData = window.uploadedImageData;
    } else {
        // 文生视频模式
        const promptEl = document.getElementById('quickPrompt');
        prompt = promptEl ? promptEl.value.trim() : '';
    }
    
    if (!prompt && currentGenMode === 'text') {
        showToast('请输入视频描述', 'error');
        return;
    }
    
    // 检查 API 配置
    const token = localStorage.getItem('api_token');
    if (!token) {
        showToast('请先配置 API Key', 'error');
        setTimeout(function() {
            window.location.href = 'settings.html';
        }, 1500);
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
    
    // 显示生成进度
    showGeneratingOverlay();
    isGenerating = true;
    
    // 检查是否使用真实 API 生成
    const useRealAPI = localStorage.getItem('use_real_api') === 'true';
    
    if (useRealAPI && currentGenMode === 'text') {
        // 使用真实 API 生成
        generateWithRealAPI(prompt, imageData);
    } else {
        // 模拟生成过程（演示模式）
        simulateGeneration(prompt, imageData);
    }
}

// 使用真实 API 生成视频
async function generateWithRealAPI(prompt, imageData) {
    const token = localStorage.getItem('api_token');
    const provider = localStorage.getItem('api_provider') || 'replicate';
    const duration = document.getElementById('quickDuration')?.value || '4';
    const style = document.getElementById('quickStyle')?.value || 'realistic';
    
    try {
        showGeneratingProgress(10, '正在连接 AI 服务...', 60);
        
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                style: style,
                duration: duration,
                provider: provider,
                apiKey: token,
                imageUrl: imageData || null
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '生成失败');
        }
        
        const data = await response.json();
        
        if (data.success) {
            if (data.status === 'completed' && data.videoUrl) {
                // 直接完成
                finishRealGeneration(prompt, data.videoUrl);
            } else if (data.status === 'processing' && (data.predictionId || data.requestId)) {
                // 需要轮询
                pollGenerationStatus(data, provider, prompt);
            }
        } else {
            throw new Error(data.error || '生成失败');
        }
        
    } catch (error) {
        hideGeneratingOverlay();
        isGenerating = false;
        showToast('生成失败: ' + error.message, 'error');
        console.error('[Generate] API 错误:', error);
    }
}

// 轮询生成状态
async function pollGenerationStatus(data, provider, prompt) {
    const maxAttempts = 60; // 最多轮询60次（约2分钟）
    let attempts = 0;
    
    const id = data.predictionId || data.requestId;
    const token = localStorage.getItem('api_token');
    
    const checkStatus = async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
            hideGeneratingOverlay();
            isGenerating = false;
            showToast('生成超时，请稍后查看历史记录', 'warning');
            return;
        }
        
        showGeneratingProgress(
            Math.min(10 + attempts * 1.5, 95),
            `正在生成中... (${attempts}/${maxAttempts})`,
            maxAttempts - attempts
        );
        
        try {
            let statusUrl;
            let headers = {};
            
            if (provider === 'fal') {
                statusUrl = `https://api.fal.ai/v1/requests/${id}`;
                headers['Authorization'] = `Key ${token}`;
            } else {
                statusUrl = `https://api.replicate.com/v1/predictions/${id}`;
                headers['Authorization'] = `Token ${token}`;
            }
            
            const response = await fetch(statusUrl, { headers });
            const result = await response.json();
            
            if (result.status === 'succeeded' || result.status === 'completed') {
                const videoUrl = result.output?.video || result.video_url || result.output;
                if (videoUrl) {
                    finishRealGeneration(prompt, videoUrl);
                    return;
                }
            } else if (result.status === 'failed' || result.status === 'error') {
                throw new Error(result.error || '生成失败');
            }
            
            // 继续轮询
            setTimeout(checkStatus, 3000);
            
        } catch (error) {
            hideGeneratingOverlay();
            isGenerating = false;
            showToast('状态检查失败: ' + error.message, 'error');
        }
    };
    
    setTimeout(checkStatus, 3000);
}

// 完成真实生成
function finishRealGeneration(prompt, videoUrl) {
    // 扣除积分
    if (!currentUser.isPro) {
        currentUser.credits--;
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
    }
    
    hideGeneratingOverlay();
    isGenerating = false;
    
    showToast('视频生成成功！', 'success');
    showVideoResult(videoUrl, prompt);
}

function simulateGeneration(prompt, imageData) {
    const stages = [
        { progress: 10, text: '正在解析提示词...' },
        { progress: 30, text: '加载AI模型中...' },
        { progress: 50, text: '生成视频帧...' },
        { progress: 70, text: '优化画面质量...' },
        { progress: 90, text: '最终渲染中...' },
        { progress: 100, text: '生成完成！' }
    ];
    
    let currentStage = 0;
    
    function nextStage() {
        if (currentStage < stages.length) {
            const stage = stages[currentStage];
            updateGeneratingProgress(stage.progress, stage.text, stages.length - currentStage);
            currentStage++;
            setTimeout(nextStage, 800);
        } else {
            finishGeneration(prompt);
        }
    }
    
    nextStage();
}

function finishGeneration(prompt) {
    // 扣除积分
    if (!currentUser.isPro) {
        currentUser.credits--;
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
    }
    
    hideGeneratingOverlay();
    isGenerating = false;
    
    // 演示视频URL - 使用多个CDN确保可用性
    const demoVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ];
    const videoUrl = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    
    showToast('视频生成成功！', 'success');
    showVideoResult(videoUrl, prompt);
}

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
    if (time) time.textContent = (timeLeft * 2) + '秒';
}

function showVideoResult(videoUrl, prompt) {
    // 创建结果弹窗
    const modal = document.createElement('div');
    modal.className = 'modal modal-video active';
    modal.innerHTML = '<div class="modal-content" style="max-width: 800px;">' +
        '<span class="close-btn" onclick="this.closest(\'.modal\').remove()">&times;</span>' +
        '<h3 style="margin-bottom: 20px;">🎉 视频生成成功！</h3>' +
        '<div class="video-player" style="margin-bottom: 20px; background: #000; border-radius: 12px; overflow: hidden;">' +
            '<video ' +
                'src="' + videoUrl + '" ' +
                'controls ' +
                'autoplay ' +
                'playsinline ' +
                'muted ' +
                'preload="auto" ' +
                'style="width: 100%; display: block;"' +
                'onerror="videoError(this)"' +
            '>' +
                '<p style="padding: 20px; color: #888; text-align: center;">' +
                    '您的浏览器不支持视频播放。' +
                    '<br>' +
                    '<a href="' + videoUrl + '" target="_blank" style="color: #6366f1;">点击这里查看视频</a>' +
                '</p>' +
            '</video>' +
        '</div>' +
        '<div style="margin-bottom: 20px;">' +
            '<p style="color: #888; font-size: 14px; margin-bottom: 8px;">提示词：</p>' +
            '<p style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">' + prompt + '</p>' +
        '</div>' +
        '<div class="video-actions" style="display: flex; gap: 12px; justify-content: center;">' +
            '<a href="' + videoUrl + '" download class="btn-action" style="text-decoration: none;">⬇️ 下载视频</a>' +
            '<button class="btn-action secondary" onclick="copyVideoUrl(\'' + videoUrl + '\')">📋 复制链接</button>' +
            '<button class="btn-action secondary" onclick="this.closest(\'.modal\').remove()">关闭</button>' +
        '</div>' +
    '</div>';
    document.body.appendChild(modal);
    
    // 尝试加载视频
    const video = modal.querySelector('video');
    if (video) {
        video.load();
        video.play().catch(function(e) {
            console.log('[Video] 自动播放被阻止:', e);
        });
    }
}

// 视频加载错误处理
function videoError(video) {
    console.error('[Video] 加载失败:', video.src);
    video.parentElement.innerHTML = 
        '<div style="padding: 40px; text-align: center; color: #888;">' +
            '<p>视频加载失败</p>' +
            '<p style="font-size: 12px; margin-top: 10px;">可能是网络问题或视频链接失效</p>' +
            '<a href="' + video.src + '" target="_blank" style="color: #6366f1; display: inline-block; margin-top: 15px;">' +
                '尝试直接打开视频' +
            '</a>' +
        '</div>';
}

function copyVideoUrl(url) {
    navigator.clipboard.writeText(url).then(function() {
        showToast('视频链接已复制', 'success');
    });
}

// ===== 提示词功能 =====
function renderPrompts(category) {
    const grid = document.getElementById('promptsGrid');
    if (!grid) return;
    
    const prompts = [
        { id: 1, category: 'nature', tag: '🌿 自然风光', text: '壮观瀑布从悬崖倾泻而下，彩虹横跨水雾，阳光穿透云层', usage: '12.5k', rating: '98%' },
        { id: 2, category: 'character', tag: '👤 人物角色', text: '优雅的中国古代仕女在庭院中抚琴，花瓣飘落，水墨画风格', usage: '8.3k', rating: '96%' },
        { id: 3, category: 'animal', tag: '🐾 动物世界', text: '雄狮在非洲草原上奔跑，夕阳余晖，金色光芒，慢动作', usage: '15.2k', rating: '99%' },
        { id: 4, category: 'scifi', tag: '🚀 科幻未来', text: '太空站环绕地球运转，星河璀璨，宇航员舱外行走', usage: '6.7k', rating: '94%' },
        { id: 5, category: 'art', tag: '🎨 艺术创意', text: '梵高星空风格的城市夜景，流动的星云，旋转的柏树', usage: '9.1k', rating: '97%' }
    ];
    
    let filtered = prompts;
    if (category && category !== 'all') {
        filtered = prompts.filter(function(p) { return p.category === category; });
    }
    
    grid.innerHTML = filtered.map(function(prompt) {
        return '<div class="prompt-card-v2">' +
            '<div class="prompt-card-content">' +
                '<div class="prompt-header">' +
                    '<span class="prompt-tag">' + prompt.tag + '</span>' +
                    '<button class="btn-copy" onclick="usePrompt(\'' + prompt.text.replace(/'/g, "\\'") + '\')">使用</button>' +
                '</div>' +
                '<p class="prompt-text-v2">' + prompt.text + '</p>' +
                '<div class="prompt-stats-v2">' +
                    '<span>🔥 ' + prompt.usage + '</span>' +
                    '<span>⭐ ' + prompt.rating + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function filterPrompts(category, element) {
    document.querySelectorAll('.prompt-cat').forEach(function(btn) { btn.classList.remove('active'); });
    if (element) element.classList.add('active');
    renderPrompts(category);
}

// ===== 工具功能 =====
function renderTools() {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    
    const tools = [
        { name: 'Runway Gen-3', icon: '🎬', rating: 4.9, price: '$28/月', desc: '目前最强的AI视频生成工具' },
        { name: 'Haiper', icon: '🎭', rating: 4.7, price: '免费', desc: '免费高质量视频生成' },
        { name: 'Kling AI', icon: '🎪', rating: 4.8, price: '$10/月', desc: '快手出品，支持2分钟长视频' }
    ];
    
    grid.innerHTML = tools.map(function(tool) {
        return '<div class="tool-card-v2">' +
            '<div class="tool-card-header">' +
                '<div class="tool-icon-v2">' + tool.icon + '</div>' +
                '<div class="tool-title-v2">' +
                    '<h4>' + tool.name + '</h4>' +
                '</div>' +
            '</div>' +
            '<p class="tool-desc-v2">' + tool.desc + '</p>' +
            '<div class="tool-card-footer">' +
                '<span class="tool-rating">⭐ ' + tool.rating + '</span>' +
                '<span class="tool-price-v2">' + tool.price + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ===== 作品展示 =====
function filterShowcase(category, element) {
    document.querySelectorAll('.filter-btn').forEach(function(btn) { btn.classList.remove('active'); });
    if (element) element.classList.add('active');
    
    const items = document.querySelectorAll('.showcase-item');
    items.forEach(function(item) {
        item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
    });
}

// ===== Toast提示 =====
function showToast(message, type) {
    type = type || 'info';
    
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    
    var icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span>';
    
    document.body.appendChild(toast);
    
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ===== 实时更新 =====
function startLiveUpdates() {
    setInterval(function() {
        const liveUsers = document.getElementById('liveUsers');
        if (liveUsers) {
            var current = parseInt(liveUsers.textContent.replace(/,/g, ''));
            var change = Math.floor(Math.random() * 50) - 25;
            liveUsers.textContent = Math.max(1000, current + change).toLocaleString();
        }
    }, 3000);
}

// ===== 全局点击事件 =====
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

console.log('[App] 脚本加载完成');
