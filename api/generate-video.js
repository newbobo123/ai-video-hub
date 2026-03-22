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
        
        if (provider === 'fal') {
            result = await generateWithFal(prompt, duration, apiKey, imageUrl);
        } else if (provider === 'replicate') {
            result = await generateWithReplicate(prompt, duration, apiKey, imageUrl);
        } else {
            // 默认使用 replicate
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
    // 根据是否有图片选择不同模型
    const version = imageUrl 
        ? 'wavespeedai/wan-2.1-i2v-480p'  // 图生视频
        : 'wavespeedai/wan-2.1-t2v-480p'; // 文生视频
    
    const input = {
        prompt: prompt,
        num_frames: (parseInt(duration) || 4) * 8,
        fps: 8,
        guidance_scale: 7.5,
        ...(imageUrl && { image: imageUrl })
    };
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'respond-async'
        },
        body: JSON.stringify({
            version: `${version}:latest`,
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
