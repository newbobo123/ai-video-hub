// ===== 生成页面功能 =====

// 当前模式
let currentMode = 'text';
let uploadedImageData = null;
let isGenerating = false;

// 示例视频数据（模拟）
const demoVideos = [
    'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4',
    'https://cdn.pixabay.com/video/2020/04/16/37102-412175983_large.mp4',
    'https://cdn.pixabay.com/video/2019/10/04/27573-363527458_large.mp4'
];

// 切换输入模式
function switchMode(mode) {
    currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.mode-tab').classList.add('active');
    
    // 切换显示
    const textSection = document.getElementById('textInputSection');
    const imageSection = document.getElementById('imageInputSection');
    
    if (mode === 'text') {
        textSection.classList.remove('hidden');
        imageSection.classList.add('hidden');
    } else {
        textSection.classList.add('hidden');
        imageSection.classList.remove('hidden');
    }
}

// 处理图片上传
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        const img = document.getElementById('uploadedImage');
        img.src = uploadedImageData;
        img.classList.remove('hidden');
        
        document.querySelector('.upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// 使用示例提示词
function useExample(element) {
    const text = element.textContent.replace(/^[^\s]+\s/, '');
    const input = document.getElementById('promptInput');
    if (input) {
        input.value = text;
        input.focus();
    }
}

// AI优化提示词（模拟）
function enhancePrompt() {
    const input = document.getElementById('promptInput');
    if (!input || !input.value.trim()) {
        alert('请先输入描述');
        return;
    }
    
    const enhancements = [
        ", 4K画质，细节丰富，光影自然",
        ", 电影级画面，柔和光线，专业摄影",
        ", 超高清，细腻纹理，真实感强"
    ];
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    input.value = input.value + randomEnhancement;
}

// 切换高级设置
function toggleSettings() {
    const content = document.getElementById('settingsContent');
    const arrow = document.querySelector('.settings-arrow');
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('open');
        arrow.style.transform = 'rotate(180deg)';
    }
}

// 生成视频
async function generateVideo() {
    if (isGenerating) return;
    
    const promptInput = document.getElementById('promptInput');
    const imagePromptInput = document.getElementById('imagePromptInput');
    const generateBtn = document.getElementById('generateBtn');
    
    // 验证输入
    let prompt = '';
    if (currentMode === 'text') {
        prompt = promptInput ? promptInput.value.trim() : '';
        if (!prompt) {
            alert('请输入视频描述');
            return;
        }
    } else {
        if (!uploadedImageData) {
            alert('请上传起始图片');
            return;
        }
        prompt = imagePromptInput ? imagePromptInput.value.trim() : '图像动画';
    }
    
    // 获取设置
    const model = document.getElementById('modelSelect')?.value || 'wan';
    const duration = document.getElementById('durationSelect')?.value || '4';
    const resolution = document.getElementById('resolutionSelect')?.value || '720p';
    
    // 开始生成
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text">生成中...</span>
    `;
    
    // 显示生成中状态
    document.getElementById('resultEmpty').classList.add('hidden');
    document.getElementById('resultContent').classList.add('hidden');
    document.getElementById('resultGenerating').classList.remove('hidden');
    
    // 模拟进度
    const progressFill = document.getElementById('progressFill');
    const generatingText = document.getElementById('generatingText');
    const timeRemaining = document.getElementById('timeRemaining');
    
    const stages = [
        { progress: 10, text: '正在解析提示词...', time: 40 },
        { progress: 25, text: '加载模型中...', time: 35 },
        { progress: 45, text: '生成视频帧...', time: 25 },
        { progress: 70, text: '优化视频质量...', time: 15 },
        { progress: 90, text: '最终渲染中...', time: 5 },
        { progress: 100, text: '生成完成！', time: 0 }
    ];
    
    for (const stage of stages) {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
        progressFill.style.width = stage.progress + '%';
        generatingText.textContent = stage.text;
        timeRemaining.textContent = stage.time;
    }
    
    // 显示结果
    await new Promise(r => setTimeout(r, 500));
    
    document.getElementById('resultGenerating').classList.add('hidden');
    document.getElementById('resultContent').classList.remove('hidden');
    
    // 设置视频
    const video = document.getElementById('generatedVideo');
    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    video.src = randomVideo;
    video.load();
    
    // 更新信息
    const modelNames = { wan: 'Wan 2.1', cogvideo: 'CogVideoX', opensora: 'Open-Sora' };
    document.getElementById('resultModel').textContent = modelNames[model] || model;
    document.getElementById('resultResolution').textContent = resolution;
    document.getElementById('resultDuration').textContent = duration + '秒';
    document.getElementById('resultTime').textContent = Math.floor(30 + Math.random() * 30) + '秒';
    
    // 恢复按钮
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
        <span class="btn-icon">✨</span>
        <span class="btn-text">开始生成视频</span>
        <span class="btn-time">预计 30-60 秒</span>
    `;
    
    // 保存到历史
    saveToHistory({
        prompt,
        model,
        duration,
        resolution,
        videoUrl: randomVideo,
        timestamp: new Date().toISOString()
    });
}

// 保存到历史
function saveToHistory(item) {
    let history = JSON.parse(localStorage.getItem('aiVideoHub_history') || '[]');
    history.unshift(item);
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('aiVideoHub_history', JSON.stringify(history));
}

// 下载视频
function downloadVideo() {
    const video = document.getElementById('generatedVideo');
    if (video && video.src) {
        const a = document.createElement('a');
        a.href = video.src;
        a.download = 'AI生成视频_' + Date.now() + '.mp4';
        a.click();
    }
}

// 重新生成
function regenerateVideo() {
    generateVideo();
}

// 分享视频
function shareVideo() {
    const shareData = {
        title: '我用AI生成的视频',
        text: '看看我用AI视频工坊生成的视频！',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        alert('分享功能：可以复制链接给朋友');
    }
}

// 显示历史记录
function showHistory() {
    const history = JSON.parse(localStorage.getItem('aiVideoHub_history') || '[]');
    if (history.length === 0) {
        alert('暂无历史记录');
        return;
    }
    
    const historyText = history.slice(0, 5).map((item, i) => 
        `${i + 1}. ${item.prompt.substring(0, 30)}... (${item.model})`
    ).join('\n');
    
    alert(`最近生成的视频：\n\n${historyText}\n\n查看更多请在控制台查看localStorage`);
}

// 字符计数
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('promptInput');
    const charCount = document.querySelector('.char-count');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            charCount.textContent = `${textarea.value.length}/500`;
        });
    }
    
    // 比例选择
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
