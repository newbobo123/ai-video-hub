// Vercel Serverless Function - 生成视频 API
export default async function handler(req, res) {
    // CORS 设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { prompt, style, duration, provider, apiKey, imageUrl } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }
    
    try {
        let result;
        
        switch (provider) {
            case 'fal':
                result = await generateWithFal(prompt, duration, apiKey, imageUrl);
                break;
            case 'replicate':
                result = await generateWithReplicate(prompt, duration, apiKey, imageUrl);
                break;
            case 'aliyun':
                result = await generateWithAliyun(prompt, duration, apiKey, imageUrl);
                break;
            case 'siliconflow':
                result = await generateWithSiliconFlow(prompt, duration, apiKey, imageUrl);
                break;
            default:
                result = await generateWithReplicate(prompt, duration, apiKey, imageUrl);
        }
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Generation error:', error);
        return res.status(500).json({ 
            error: 'Generation failed', 
            message: error.message 
        });
    }
}

// Fal.ai 视频生成
async function generateWithFal(prompt, duration, apiKey, imageUrl) {
    const model = imageUrl ? 'fal-ai/wan-i2v' : 'fal-ai/wan-t2v';
    
    const response = await fetch(`https://api.fal.ai/v1/${model}`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            duration: parseInt(duration) || 4,
            aspect_ratio: '16:9',
            ...(imageUrl && { image_url: imageUrl })
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Fal API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    // Fal.ai 返回的是直接结果或 request_id
    if (data.video_url) {
        return {
            success: true,
            videoUrl: data.video_url,
            status: 'completed'
        };
    }
    
    // 需要轮询
    if (data.request_id) {
        return {
            success: true,
            requestId: data.request_id,
            status: 'processing',
            provider: 'fal'
        };
    }
    
    throw new Error('Unexpected Fal API response');
}

// Replicate 视频生成
async function generateWithReplicate(prompt, duration, apiKey, imageUrl) {
    // Replicate 模型标识符
    const model = imageUrl 
        ? 'wavespeedai/wan-2.1-i2v-480p'  // 图生视频
        : 'wavespeedai/wan-2.1-t2v-480p'; // 文生视频
    
    const input = {
        prompt: prompt,
        num_frames: (parseInt(duration) || 4) * 8,
        fps: 8,
        guidance_scale: 7.5
    };
    
    if (imageUrl) {
        input.image = imageUrl;
    }
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'respond-async'
        },
        body: JSON.stringify({
            model: model,
            input: input
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Replicate API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    return {
        success: true,
        predictionId: data.id,
        status: 'processing',
        provider: 'replicate'
    };
}

// 阿里云通义万相视频生成
async function generateWithAliyun(prompt, duration, apiKey, imageUrl) {
    // 解析 AccessKey
    const [accessKeyId, accessKeySecret] = apiKey.split(':');
    
    if (!accessKeyId || !accessKeySecret) {
        throw new Error('阿里云 AccessKey 格式错误，请使用 "AccessKeyID:AccessKeySecret" 格式');
    }
    
    // 选择模型
    const model = imageUrl 
        ? 'wanx2.1-i2v-turbo'  // 图生视频
        : 'wanx2.1-t2v-turbo'; // 文生视频
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessKeyId}`,
            'Content-Type': 'application/json',
            'X-DashScope-DataInspection': 'disable'
        },
        body: JSON.stringify({
            model: model,
            input: imageUrl ? {
                prompt: prompt,
                img_url: imageUrl
            } : {
                prompt: prompt
            },
            parameters: {
                size: '1280*720',
                duration: parseInt(duration) || 4
            }
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`阿里云 API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    // 阿里云返回任务ID
    if (data.output?.task_id) {
        return {
            success: true,
            predictionId: data.output.task_id,
            status: 'processing',
            provider: 'aliyun'
        };
    }
    
    throw new Error('Unexpected 阿里云 API response');
}

// 硅基流动视频生成
async function generateWithSiliconFlow(prompt, duration, apiKey, imageUrl) {
    // 硅基流动支持多种模型
    const model = imageUrl 
        ? 'stabilityai/stable-video-diffusion'  // 图生视频
        : 'lightricks/ltx-video';  // 文生视频
    
    const response = await fetch('https://api.siliconflow.cn/v1/video/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            ...(imageUrl && { image_url: imageUrl }),
            duration: parseInt(duration) || 4,
            size: '1280x720'
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`硅基流动 API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    // 硅基流动可能直接返回视频URL或任务ID
    if (data.video_url || data.url) {
        return {
            success: true,
            videoUrl: data.video_url || data.url,
            status: 'completed'
        };
    }
    
    if (data.id || data.task_id) {
        return {
            success: true,
            predictionId: data.id || data.task_id,
            status: 'processing',
            provider: 'siliconflow'
        };
    }
    
    throw new Error('Unexpected 硅基流动 API response');
}
