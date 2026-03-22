// ==========================================
// 检查生成权限 API
// 在用户点击生成前调用
// ==========================================

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 生成成本配置
const GENERATION_COST = {
  text_to_video: {
    '720p': 1,
    '1080p': 2,
    '4k': 4
  },
  image_to_video: {
    '720p': 2,
    '1080p': 3,
    '4k': 6
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, generation_type, resolution } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await checkGenerationPermission(email, generation_type, resolution);
    
    return res.status(200).json({
      success: true,
      allowed: result.allowed,
      reason: result.reason,
      cost: result.cost,
      remaining_after: result.remaining_after,
      user_plan: result.user_plan
    });
    
  } catch (error) {
    console.error('[API] 检查权限失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ========== 检查生成权限 ==========
async function checkGenerationPermission(email, generationType = 'text_to_video', resolution = '720p') {
  // 获取用户订阅状态
  const customers = await stripe.customers.list({
    email: email,
    limit: 1
  });
  
  let userPlan = 'free';
  let isActive = false;
  let subscriptionMeta = {};
  
  if (customers.data.length > 0) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length > 0) {
      userPlan = subscriptions.data[0].metadata.plan || 'pro';
      isActive = true;
      subscriptionMeta = subscriptions.data[0].metadata;
    }
  }
  
  // 计算本次生成成本
  const cost = (GENERATION_COST[generationType] && GENERATION_COST[generationType][resolution]) || 1;
  
  // 专业版和企业版无限生成
  if (userPlan === 'pro' || userPlan === 'enterprise') {
    return {
      allowed: true,
      reason: 'unlimited_plan',
      cost: cost,
      remaining_after: -1,
      user_plan: userPlan
    };
  }
  
  // 入门版检查月度限额
  if (userPlan === 'starter') {
    // TODO: 从数据库获取本月已使用次数
    const usedThisMonth = 0; // 实际应从数据库查询
    const limit = 50;
    
    if (usedThisMonth >= limit) {
      return {
        allowed: false,
        reason: 'monthly_limit_exceeded',
        cost: cost,
        remaining_after: 0,
        user_plan: userPlan,
        limit: limit,
        used: usedThisMonth
      };
    }
    
    return {
      allowed: true,
      reason: 'within_limit',
      cost: cost,
      remaining_after: limit - usedThisMonth - 1,
      user_plan: userPlan,
      limit: limit,
      used: usedThisMonth
    };
  }
  
  // 免费版检查积分
  // TODO: 从数据库获取用户积分
  const userCredits = 3; // 默认免费3次，实际应从数据库查询
  
  if (userCredits < cost) {
    return {
      allowed: false,
      reason: 'insufficient_credits',
      cost: cost,
      remaining_after: userCredits,
      user_plan: userPlan,
      current_credits: userCredits
    };
  }
  
  return {
    allowed: true,
    reason: 'sufficient_credits',
    cost: cost,
    remaining_after: userCredits - cost,
    user_plan: userPlan,
    current_credits: userCredits
  };
}
