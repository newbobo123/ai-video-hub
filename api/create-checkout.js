// ==========================================
// Stripe 支付集成 API
// ==========================================

const Stripe = require('stripe');

// 初始化Stripe（使用环境变量）
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 价格配置（与前端保持一致）
const PRICE_CONFIG = {
  starter: {
    name: '入门版',
    price_cny: 1900, // ¥19 = 1900分
    credits: 50,
    features: ['720P输出', '标准队列', '基础模型']
  },
  pro: {
    name: '专业版', 
    price_cny: 4900, // ¥49 = 4900分
    price_id: process.env.STRIPE_PRICE_ID_PRO, // 从Stripe Dashboard创建
    features: ['4K输出', '优先队列', '全部模型', '商业授权']
  },
  enterprise: {
    name: '企业版',
    price_cny: 19900, // ¥199 = 19900分
    price_id: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    features: ['团队共享', 'API访问', '专属客服', 'SLA保障']
  }
};

// ==========================================
// 1. 创建Checkout会话
// ==========================================
export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { plan, email, success_url, cancel_url } = req.body;
  
  if (!plan || !PRICE_CONFIG[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  
  try {
    // 查找或创建客户
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          plan: plan
        }
      });
    }
    
    let sessionConfig;
    
    // 专业版和企业版使用订阅模式
    if (plan === 'pro' || plan === 'enterprise') {
      const priceId = PRICE_CONFIG[plan].price_id;
      
      if (!priceId) {
        // 如果未配置Price ID，创建一次性支付
        sessionConfig = {
          customer: customer.id,
          line_items: [{
            price_data: {
              currency: 'cny',
              product_data: {
                name: `Super AI Video - ${PRICE_CONFIG[plan].name}`,
                description: `月度订阅 - ${PRICE_CONFIG[plan].features.join(', ')}`
              },
              unit_amount: PRICE_CONFIG[plan].price_cny,
              recurring: { interval: 'month' }
            },
            quantity: 1
          }],
          mode: 'subscription',
          success_url: success_url || `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancel_url || `${req.headers.origin}/payment/cancel`,
          subscription_data: {
            metadata: {
              plan: plan,
              email: email
            }
          }
        };
      } else {
        sessionConfig = {
          customer: customer.id,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: 'subscription',
          success_url: success_url || `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancel_url || `${req.headers.origin}/payment/cancel`,
          subscription_data: {
            metadata: {
              plan: plan,
              email: email
            }
          }
        };
      }
    } else {
      // 入门版使用一次性支付
      sessionConfig = {
        customer: customer.id,
        line_items: [{
          price_data: {
            currency: 'cny',
            product_data: {
              name: `Super AI Video - ${PRICE_CONFIG[plan].name}`,
              description: `一次性购买 - ${PRICE_CONFIG[plan].credits}次生成额度`
            },
            unit_amount: PRICE_CONFIG[plan].price_cny
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: success_url || `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${req.headers.origin}/payment/cancel`,
        payment_intent_data: {
          metadata: {
            plan: plan,
            email: email,
            credits: PRICE_CONFIG[plan].credits
          }
        }
      };
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error) {
    console.error('[Stripe] 创建Checkout会话失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
