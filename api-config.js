// 从环境变量读取API密钥（Vercel环境变量支持）
const API_CONFIG = {
    USE_MOCK: false,
    
    REPLICATE: {
        // 优先从环境变量读取，否则使用空字符串（需要配置）
        TOKEN: typeof window !== 'undefined' && window.ENV?.REPLICATE_API_TOKEN 
            ? window.ENV.REPLICATE_API_TOKEN 
            : '',
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

// 向后兼容：如果window.API_TOKEN存在，使用它
if (typeof window !== 'undefined' && window.API_TOKEN) {
    API_CONFIG.REPLICATE.TOKEN = window.API_TOKEN;
}
