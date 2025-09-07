// Stripe integration for premium subscriptions
// Note: In production, payment processing should be handled by a secure backend

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripe = null

export const initializeStripe = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not found. Payment features will be disabled.')
    return null
  }

  if (!stripe) {
    const { loadStripe } = await import('@stripe/stripe-js')
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY)
  }

  return stripe
}

export const createCheckoutSession = async (priceId, userId) => {
  try {
    // In a real application, this would call your backend API
    // which would create a Stripe checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/profile`,
      }),
    })

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const redirectToCheckout = async (sessionId) => {
  const stripeInstance = await initializeStripe()
  
  if (!stripeInstance) {
    throw new Error('Stripe not initialized')
  }

  const { error } = await stripeInstance.redirectToCheckout({
    sessionId,
  })

  if (error) {
    throw error
  }
}

// Mock implementation for demo purposes
export const mockPremiumUpgrade = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        customerId: `cus_${Date.now()}`,
        status: 'active'
      })
    }, 2000)
  })
}

// Subscription management
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    })

    return await response.json()
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export const getSubscriptionStatus = async (customerId) => {
  try {
    const response = await fetch(`/api/subscription-status/${customerId}`)
    return await response.json()
  } catch (error) {
    console.error('Error getting subscription status:', error)
    throw error
  }
}

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 recordings per day',
      'Basic species identification',
      'Simple behavioral insights',
      'Personal sound library'
    ],
    limitations: {
      dailyRecordings: 5,
      advancedInsights: false,
      offlineMode: false,
      spectrogramView: false
    }
  },
  premium: {
    name: 'Premium',
    price: 5,
    priceId: 'price_premium_monthly', // This would be your actual Stripe price ID
    features: [
      'Unlimited recordings',
      'Advanced AI analysis',
      'Detailed behavioral insights',
      'Spectrogram visualization',
      'Offline mode',
      'Priority support',
      'Research contribution tools'
    ],
    limitations: {
      dailyRecordings: Infinity,
      advancedInsights: true,
      offlineMode: true,
      spectrogramView: true
    }
  }
}

export const checkFeatureAccess = (feature, isPremium) => {
  const plan = isPremium ? PRICING_PLANS.premium : PRICING_PLANS.free
  return plan.limitations[feature] || false
}
