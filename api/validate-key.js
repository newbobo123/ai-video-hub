// Vercel Serverless Function - 验证 API Key
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
    
    const { provider, apiKey } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }
    
    try {
        let isValid = false;
        let message = '';
        let models = 0;
        
        if (provider === 'fal' || provider === 'auto') {
            // 测试 Fal.ai
            try {
                const response = await fetch('https://api.fal.ai/v1/user/info', {
                    headers: { 'Authorization': `Key ${apiKey}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    isValid = true;
                    message = 'Fal.ai API Key 有效';
                    // Fal 没有模型列表接口，返回固定数量
                    models = 5;
                }
            } catch (e) {
                // Fal 测试失败，继续测试 Replicate
            }
        }
        
        if (!isValid && (provider === 'replicate' || provider === 'auto')) {
            // 测试 Replicate
            const response = await fetch('https://api.replicate.com/v1/models', {
                headers: { 
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                isValid = true;
                message = 'Replicate API Key 有效';
                models = data.results?.length || 0;
            } else {
                message = `API Key 无效: ${response.status}`;
            }
        }
        
        if (isValid) {
            return res.status(200).json({
                success: true,
                message: message,
                models: models
            });
        } else {
            return res.status(401).json({
                success: false,
                error: message || 'API Key 验证失败'
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: '验证过程中出错: ' + error.message
        });
    }
}
