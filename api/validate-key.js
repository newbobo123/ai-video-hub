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
        
        if (provider === 'fal') {
            // 测试 Fal.ai
            const response = await fetch('https://api.fal.ai/v1/user/info', {
                headers: { 'Authorization': `Key ${apiKey}` }
            });
            
            if (response.ok) {
                isValid = true;
                message = 'Fal.ai API Key 有效';
                models = 5;
            } else {
                message = `Fal.ai API Key 无效: ${response.status}`;
            }
        }
        else if (provider === 'replicate') {
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
                message = `Replicate API Key 无效: ${response.status}`;
            }
        }
        else if (provider === 'aliyun') {
            // 测试阿里云通义万相
            // 阿里云需要 AccessKey ID 和 Secret，格式为 "ID:Secret"
            const [accessKeyId, accessKeySecret] = apiKey.split(':');
            
            if (!accessKeyId || !accessKeySecret) {
                return res.status(400).json({
                    success: false,
                    error: '阿里云 AccessKey 格式错误，请使用 "AccessKeyID:AccessKeySecret" 格式'
                });
            }
            
            // 尝试调用阿里云API验证
            try {
                const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessKeyId}`,
                        'Content-Type': 'application/json',
                        'X-DashScope-DataInspection': 'disable'
                    },
                    body: JSON.stringify({
                        model: 'wanx2.1-t2v-turbo',
                        input: { prompt: '测试' }
                    })
                });
                
                // 阿里云验证比较特殊，我们检查是否能正确返回错误而不是认证失败
                const data = await response.json().catch(() => ({}));
                
                if (response.status === 401 || response.status === 403) {
                    message = '阿里云 AccessKey 无效或已过期';
                } else {
                    // 非401错误说明认证通过，只是参数可能有误
                    isValid = true;
                    message = '阿里云 AccessKey 有效';
                    models = 4; // 通义万相有多个模型版本
                }
            } catch (e) {
                message = '阿里云 API 连接失败，请检查网络';
            }
        }
        else if (provider === 'siliconflow') {
            // 测试硅基流动
            const response = await fetch('https://api.siliconflow.cn/v1/user/info', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                isValid = true;
                message = '硅基流动 API Key 有效';
                models = data.models?.length || 10;
            } else if (response.status === 401) {
                message = '硅基流动 API Key 无效';
            } else {
                message = `验证失败: ${response.status}`;
            }
        }
        else {
            return res.status(400).json({
                success: false,
                error: `未知的提供商: ${provider}`
            });
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
