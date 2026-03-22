// ==========================================
// Stripe 支付集成前端模块
// ==========================================

const PaymentManager = {
  // Stripe配置
  config: {
    // 你的Stripe公钥（从Stripe Dashboard获取）
    publishableKey: '',
    // API端点
    apiEndpoint: '/api'
  },
  
  // 初始化
  init() {
    // 从环境变量或配置文件加载Stripe公钥
    this.loadConfig();
  },
  
  // 加载配置
  loadConfig() {
    // 尝试从全局配置加载
    if (window.STRIPE_CONFIG) {
      this.config.publishableKey = window.STRIPE_CONFIG.publishableKey;
    }
  },
  
  // ========== 选择套餐并跳转到支付 ==========
  async selectPlan(plan) {
    console.log('[Payment] 选择套餐:', plan);
    
    // 检查用户是否登录
    if (!currentUser) {
      closePaywall();
      openAuthModal();
      showToast('请先登录', 'info');
      return;
    }
    
    // 如果未配置Stripe，显示提示
    if (!this.config.publishableKey) {
      showToast('支付系统配置中，请稍后再试', 'warning');
      console.warn('[Payment] Stripe公钥未配置');
      return;
    }
    
    try {
      showToast('正在创建支付会话...', 'info');
      
      // 调用后端创建Checkout会话
      const response = await fetch(`${this.config.apiEndpoint}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: plan,
          email: currentUser.email,
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancel`
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // 跳转到Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || '创建支付会话失败');
      }
      
    } catch (error) {
      console.error('[Payment] 支付出错:', error);
      showToast('支付出错: ' + error.message, 'error');
      
      // 演示模式：模拟支付成功
      this.simulatePayment(plan);
    }
  },
  
  // ========== 模拟支付（演示模式） ==========
  simulatePayment(plan) {
    console.log('[Payment] 模拟支付:', plan);
    
    setTimeout(() => {
      // 更新用户状态
      currentUser.plan = plan;
      currentUser.isPro = (plan === 'pro' || plan === 'enterprise');
      currentUser.subscriptionStatus = 'active';
      
      if (plan === 'starter') {
        currentUser.credits += 50;
      } else if (plan === 'pro' || plan === 'enterprise') {
        currentUser.credits = -1; // 无限
      }
      
      localStorage.setItem('sa_user', JSON.stringify(currentUser));
      
      closePaywall();
      updateUIForLoggedInUser();
      showToast('升级成功！享受专业版功能', 'success');
      
    }, 1500);
  },
  
  // ========== 获取用户订阅状态 ==========
  async getSubscriptionStatus() {
    if (!currentUser) return null;
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/subscription?email=${encodeURIComponent(currentUser.email)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('[Payment] 获取订阅状态失败:', error);
      return null;
    }
  },
  
  // ========== 检查生成权限 ==========
  async checkGenerationPermission(generationType = 'text_to_video', resolution = '720p') {
    if (!currentUser) {
      return { allowed: false, reason: 'not_logged_in' };
    }
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/check-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: currentUser.email,
          generation_type: generationType,
          resolution: resolution
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data;
      }
      
      return { allowed: false, reason: 'check_failed' };
    } catch (error) {
      console.error('[Payment] 检查权限失败:', error);
      
      // 演示模式：允许生成
      return { 
        allowed: true, 
        reason: 'demo_mode',
        cost: 1,
        user_plan: currentUser.plan || 'free'
      };
    }
  },
  
  // ========== 处理支付成功回调 ==========
  async handlePaymentSuccess(sessionId) {
    console.log('[Payment] 处理支付成功:', sessionId);
    
    if (!currentUser || !sessionId) return;
    
    try {
      // 同步订阅状态
      const response = await fetch(`${this.config.apiEndpoint}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: currentUser.email,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 更新本地用户状态
        currentUser.subscriptionStatus = 'active';
        localStorage.setItem('sa_user', JSON.stringify(currentUser));
        
        showToast('支付成功！订阅已激活', 'success');
        
        // 刷新页面以更新UI
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      console.error('[Payment] 处理支付成功回调失败:', error);
    }
  }
};

// ========== 支付成功页面处理 ==========
function handlePaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    PaymentManager.handlePaymentSuccess(sessionId);
  }
}

// ========== 页面加载时检查支付回调 ==========
document.addEventListener('DOMContentLoaded', function() {
  PaymentManager.init();
  
  // 检查是否在支付回调页面
  if (window.location.pathname.includes('/payment/success')) {
    handlePaymentCallback();
  }
});
