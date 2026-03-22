// ==========================================
// Stripe Webhook 处理
// 处理支付成功、订阅更新等事件
// ==========================================

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook密钥（从Stripe Dashboard获取）
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    // 验证Webhook签名
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('[Webhook] 签名验证失败:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log('[Webhook] 收到事件:', event.type);
  
  try {
    switch (event.type) {
      // ========== 一次性支付成功 ==========
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // 检查是否为订阅模式
        if (session.mode === 'payment') {
          await handleOneTimePayment(session);
        }
        break;
      }
      
      // ========== 订阅创建成功 ==========
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }
      
      // ========== 订阅更新 ==========
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      // ========== 订阅取消 ==========
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      // ========== 发票支付成功 ==========
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }
      
      // ========== 发票支付失败 ==========
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
      
      default:
        console.log(`[Webhook] 未处理的事件类型: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('[Webhook] 处理事件失败:', error);
    res.status(500).json({ error: error.message });
  }
}

// ========== 处理一次性支付 ==========
async function handleOneTimePayment(session) {
  const { plan, email, credits } = session.metadata || {};
  
  console.log('[Webhook] 处理一次性支付:', { email, plan, credits });
  
  // TODO: 更新数据库，增加用户积分
  // 这里应该调用你的数据库操作
  // await db.users.updateOne(
  //   { email },
  //   { $inc: { credits: parseInt(credits) || 0 } }
  // );
  
  // 临时：存储到KV或发送通知
  await notifyUser(email, {
    type: 'payment_success',
    plan,
    credits: parseInt(credits),
    amount: session.amount_total
  });
}

// ========== 处理订阅创建 ==========
async function handleSubscriptionCreated(subscription) {
  const { plan, email } = subscription.metadata || {};
  
  console.log('[Webhook] 订阅创建:', { email, plan, status: subscription.status });
  
  if (subscription.status === 'active') {
    // TODO: 激活用户订阅
    // await db.subscriptions.insertOne({
    //   user_email: email,
    //   stripe_subscription_id: subscription.id,
    //   plan: plan,
    //   status: 'active',
    //   current_period_start: new Date(subscription.current_period_start * 1000),
    //   current_period_end: new Date(subscription.current_period_end * 1000)
    // });
    
    await notifyUser(email, {
      type: 'subscription_activated',
      plan,
      expires_at: subscription.current_period_end * 1000
    });
  }
}

// ========== 处理订阅更新 ==========
async function handleSubscriptionUpdated(subscription) {
  const { email } = subscription.metadata || {};
  
  console.log('[Webhook] 订阅更新:', { 
    email, 
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end 
  });
  
  // TODO: 更新订阅状态
  // await db.subscriptions.updateOne(
  //   { stripe_subscription_id: subscription.id },
  //   {
  //     status: subscription.status,
  //     cancel_at_period_end: subscription.cancel_at_period_end,
  //     current_period_end: new Date(subscription.current_period_end * 1000)
  //   }
  // );
}

// ========== 处理订阅删除 ==========
async function handleSubscriptionDeleted(subscription) {
  const { email } = subscription.metadata || {};
  
  console.log('[Webhook] 订阅取消:', { email });
  
  // TODO: 降级用户到免费版
  // await db.subscriptions.updateOne(
  //   { stripe_subscription_id: subscription.id },
  //   { status: 'cancelled', cancelled_at: new Date() }
  // );
  
  // await db.users.updateOne(
  //   { email },
  //   { plan: 'free', subscription_status: 'inactive' }
  // );
  
  await notifyUser(email, {
    type: 'subscription_cancelled'
  });
}

// ========== 处理发票支付成功（周期性扣款） ==========
async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return; // 不是订阅的发票
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const { email, plan } = subscription.metadata || {};
  
  console.log('[Webhook] 订阅续费成功:', { email, plan });
  
  // 续费成功，延长订阅时间
  await notifyUser(email, {
    type: 'subscription_renewed',
    plan,
    period_end: subscription.current_period_end * 1000
  });
}

// ========== 处理支付失败 ==========
async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const { email } = subscription.metadata || {};
  
  console.log('[Webhook] 支付失败:', { email, attempt_count: invoice.attempt_count });
  
  // 发送支付失败通知
  await notifyUser(email, {
    type: 'payment_failed',
    invoice_url: invoice.hosted_invoice_url,
    attempt_count: invoice.attempt_count
  });
}

// ========== 用户通知函数 ==========
async function notifyUser(email, data) {
  // TODO: 实现通知逻辑
  // 可以是发送邮件、存储通知到数据库等
  console.log('[Notify]', email, data);
}

// 配置raw body解析（Stripe需要）
export const config = {
  api: {
    bodyParser: false
  }
};
