// ==========================================
// 用户订阅状态查询 API
// ==========================================

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 模拟数据库（实际使用应连接真实数据库）
const mockUserDB = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return getUserSubscription(req, res);
  }
  
  if (req.method === 'POST') {
    return syncUserSubscription(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ========== 获取用户订阅状态 ==========
async function getUserSubscription(req, res) {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    // 从Stripe获取客户信息
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    let subscriptionData = {
      email,
      plan: 'free',
      status: 'inactive',
      credits: 3, // 免费用户默认3次
      features: getFeatures('free'),
      expires_at: null
    };
    
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      
      // 获取活跃订阅
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        const plan = sub.metadata.plan || 'pro';
        
        subscriptionData = {
          email,
          plan: plan,
          status: 'active',
          credits: plan === 'pro' ? -1 : (plan === 'enterprise' ? -1 : 50), // -1表示无限
          features: getFeatures(plan),
          subscription_id: sub.id,
          current_period_start: sub.current_period_start * 1000,
          current_period_end: sub.current_period_end * 1000,
          cancel_at_period_end: sub.cancel_at_period_end
        };
      }
      
      // 获取一次性购买记录（积分）
      const charges = await stripe.charges.list({
        customer: customer.id,
        limit: 10
      });
      
      let purchasedCredits = 0;
      charges.data.forEach(charge => {
        if (charge.paid && charge.metadata.credits) {
          purchasedCredits += parseInt(charge.metadata.credits);
        }
      });
      
      if (purchasedCredits > 0) {
        subscriptionData.purchased_credits = purchasedCredits;
        subscriptionData.total_credits = (subscriptionData.credits === -1 ? -1 : subscriptionData.credits + purchasedCredits);
      }
    }
    
    // 获取用户已使用的生成次数（从mock DB）
    const userData = mockUserDB.get(email);
    if (userData) {
      subscriptionData.used_credits = userData.used_credits || 0;
      subscriptionData.remaining_credits = subscriptionData.credits === -1 
        ? -1 
        : Math.max(0, (subscriptionData.total_credits || subscriptionData.credits) - subscriptionData.used_credits);
    } else {
      subscriptionData.used_credits = 0;
      subscriptionData.remaining_credits = subscriptionData.credits;
    }
    
    return res.status(200).json({
      success: true,
      data: subscriptionData
    });
    
  } catch (error) {
    console.error('[API] 获取订阅状态失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ========== 同步用户订阅状态 ==========
async function syncUserSubscription(req, res) {
  const { email, session_id } = req.body;
  
  if (!email || !session_id) {
    return res.status(400).json({ error: 'Email and session_id are required' });
  }
  
  try {
    // 从Stripe获取会话详情
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }
    
    // 更新用户数据
    const userData = mockUserDB.get(email) || { used_credits: 0 };
    
    if (session.mode === 'subscription') {
      // 订阅模式
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const plan = subscription.metadata.plan || 'pro';
      
      userData.plan = plan;
      userData.subscription_status = 'active';
      userData.subscription_id = subscription.id;
      userData.current_period_end = subscription.current_period_end * 1000;
    } else {
      // 一次性支付模式
      const credits = parseInt(session.metadata.credits) || 0;
      userData.purchased_credits = (userData.purchased_credits || 0) + credits;
    }
    
    mockUserDB.set(email, userData);
    
    return res.status(200).json({
      success: true,
      data: userData
    });
    
  } catch (error) {
    console.error('[API] 同步订阅状态失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ========== 获取功能列表 ==========
function getFeatures(plan) {
  const features = {
    free: {
      max_resolution: '720p',
      max_duration: 4,
      max_generations_per_month: 3,
      priority: 'low',
      models: ['basic'],
      watermark: true,
      commercial_use: false
    },
    starter: {
      max_resolution: '720p',
      max_duration: 8,
      max_generations_per_month: 50,
      priority: 'normal',
      models: ['basic', 'standard'],
      watermark: false,
      commercial_use: false
    },
    pro: {
      max_resolution: '4k',
      max_duration: 8,
      max_generations_per_month: -1, // 无限
      priority: 'high',
      models: ['basic', 'standard', 'premium', 'wan21', 'cogvideo'],
      watermark: false,
      commercial_use: true
    },
    enterprise: {
      max_resolution: '4k',
      max_duration: 16,
      max_generations_per_month: -1,
      priority: 'highest',
      models: ['all'],
      watermark: false,
      commercial_use: true,
      api_access: true,
      team_members: true
    }
  };
  
  return features[plan] || features.free;
}
