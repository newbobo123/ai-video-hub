// Vercel Serverless Function - 测试 Replicate API 连接
export default async function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    
    try {
        // 测试调用 Replicate API
        const response = await fetch('https://api.replicate.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({ 
                success: true, 
                message: 'API 连接成功！Token 有效',
                models: data.results ? data.results.length : 0
            });
        } else {
            const error = await response.text();
            return res.status(401).json({ 
                success: false, 
                error: `Token 无效: ${response.status}` 
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: `网络错误: ${error.message}` 
        });
    }
}
