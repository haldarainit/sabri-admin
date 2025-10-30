// Google Analytics configuration and tracking utilities

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export const pageview = (url) => {
  console.log('🔍 GA: Tracking page view:', url);
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
    console.log('✅ GA: Page view tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for page tracking');
  }
};

// Track custom events
export const event = ({ action, category, label, value }) => {
  console.log('🔍 GA: Tracking event:', { action, category, label, value });
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('✅ GA: Event tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for event tracking');
  }
};

// Track e-commerce events
export const trackPurchase = (transactionId, value, currency = 'USD', items = []) => {
  console.log('🔍 GA: Tracking purchase:', { transactionId, value, currency, items });
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
    console.log('✅ GA: Purchase tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for purchase tracking');
  }
};

// Track product views
export const trackProductView = (productId, productName, category, price) => {
  console.log('🔍 GA: Tracking product view:', { productId, productName, category, price });
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
      }],
    });
    console.log('✅ GA: Product view tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for product view tracking');
  }
};

// Track add to cart events
export const trackAddToCart = (productId, productName, category, price, quantity = 1) => {
  console.log('🔍 GA: Tracking add to cart:', { productId, productName, category, price, quantity });
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: quantity,
      }],
    });
    console.log('✅ GA: Add to cart tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for add to cart tracking');
  }
};

// Track admin actions
export const trackAdminAction = (action, details = {}) => {
  console.log('🔍 GA: Tracking admin action:', { action, details });
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'admin_action', {
      event_category: 'admin',
      event_label: action,
      custom_parameters: details,
    });
    console.log('✅ GA: Admin action tracked successfully');
  } else {
    console.warn('⚠️ GA: gtag not available for admin action tracking');
  }
};

// Initialize Google Analytics
export const initGA = () => {
  console.log('🚀 GA: Initializing Google Analytics...');
  console.log('🔑 GA: Tracking ID:', GA_TRACKING_ID);
  
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script);
      console.log('✅ GA: Script loaded successfully');

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
      });
      console.log('✅ GA: Google Analytics initialized successfully');
    } catch (error) {
      console.error('❌ GA: Failed to initialize Google Analytics:', error);
    }
  } else {
    console.warn('⚠️ GA: Google Analytics not initialized - missing tracking ID or not in browser');
  }
};

