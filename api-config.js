// 从环境变量或 localStorage 读取API密钥
const API_CONFIG = {
    USE_MOCK: false,
    
    REPLICATE: {
        // 优先级: 1. window.API_TOKEN  2. localStorage  3. 空字符串
        TOKEN: (typeof window !== 'undefined' && (window.API_TOKEN || localStorage.getItem('api_token'))) || '',
        MODELS: {
            WAN: 'wavespeedai/wan-2.1-i2v-480p',
            COGVIDEO: 'thudm/cogvideox-5b',
            STABLE_VIDEO: 'stability-ai/stable-video-diffusion'
        }
    },
    
    FAL: {
        KEY: '',
        MODELS: {
            WAN: 'fal-ai/wan-i2v',
            VIDEO_LDM: 'fal-ai/video-ldm'
        }
    },
    
    RUNWAY: {
        KEY: '',
        ENDPOINT: 'https://api.runwayml.com/v1'
    }
};

// 页面加载时自动从 localStorage 更新 token
if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('api_token');
    if (storedToken) {
        API_CONFIG.REPLICATE.TOKEN = storedToken;
        window.API_TOKEN = storedToken;
    }
}
