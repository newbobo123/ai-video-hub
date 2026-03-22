// Vercel Serverless Function - 查询生成结果
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { provider, requestId, predictionId, apiKey } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }
    
    try {
        let result;
        
        if (provider === 'fal' && requestId) {
            result = await pollFalResult(requestId, apiKey);
        } else if (provider === 'replicate' && predictionId) {
            result = await pollReplicateResult(predictionId, apiKey);
        } else {
            return res.status(400).json({ error: 'Invalid provider or missing ID' });
        }
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Poll error:', error);
        return res.status(500).json({ 
            error: 'Failed to get result', 
            message: error.message 
        });
    }
}

async function pollFalResult(requestId, apiKey) {
    const response = await fetch(`https://api.fal.ai/v1/requests/${requestId}`, {
        headers: { 
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Fal API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'completed') {
        return {
            success: true,
            status: 'completed',
            videoUrl: data.output?.video_url || data.video_url,
            logs: data.logs
        };
    } else if (data.status === 'failed') {
        return {
            success: false,
            status: 'failed',
            error: data.error || 'Generation failed'
        };
    }
    
    return {
        success: true,
        status: 'processing',
        progress: data.progress || 0,
        logs: data.logs
    };
}

async function pollReplicateResult(predictionId, apiKey) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'succeeded') {
        // Replicate 的输出可能是字符串或数组
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        return {
            success: true,
            status: 'completed',
            videoUrl: output,
            logs: data.logs?.join('\n') || ''
        };
    } else if (data.status === 'failed') {
        return {
            success: false,
            status: 'failed',
            error: data.error || 'Generation failed'
        };
    } else if (data.status === 'canceled') {
        return {
            success: false,
            status: 'canceled',
            error: 'Generation was canceled'
        };
    }
    
    // 计算进度
    const progress = data.progress ? Math.round(data.progress * 100) : 
                     data.logs ? Math.min(95, data.logs.length * 5) : 0;
    
    return {
        success: true,
        status: 'processing',
        progress: progress,
        logs: Array.isArray(data.logs) ? data.logs.join('\n') : data.logs || ''
    };
}
