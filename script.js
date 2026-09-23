const cart = JSON.parse(localStorage.getItem('aquapure-cart') || '[]');
const cartDialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const formStatus = document.querySelector('#form-status');
const servicePincode = document.querySelector('#service-pincode');
const serviceStatus = document.querySelector('#service-status');
const deliveryDate = document.querySelector('#delivery-date');
const scrollProgress = document.querySelector('#scroll-progress');
const backToTop = document.querySelector('#back-to-top');
const toast = document.querySelector('#toast');
const heroImage = document.querySelector('.hero-image img');
const stats = document.querySelectorAll('[data-count]');
const themeToggle = document.querySelector('#theme-toggle');

const savedTheme = localStorage.getItem('aquapure-theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('aquapure-theme', 'dark');
    themeToggle.textContent = '☀️';
  } else {
    localStorage.setItem('aquapure-theme', 'light');
    themeToggle.textContent = '🌙';
  }
});

const revealItems = document.querySelectorAll(
  '.about, .benefits, .delivery-steps, .products, .subscriptions, .testimonials, .blog, .faq, .contact, .policies, .trust-stats, .benefit-item, .step-item, .product-card, .sub-card, .testimonial-card, .blog-card, .faq details, .policy-grid details'
);

const formatPrice = (value) => `₹${value.toLocaleString('en-IN')}`;
const today = new Date().toISOString().split('T')[0];
deliveryDate.min = today;

function updateScrollControls() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  backToTop.classList.toggle('visible', window.scrollY > 500);
}

window.addEventListener('scroll', updateScrollControls, { passive: true });
updateScrollControls();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach((navLink) => navLink.classList.remove('active'));
    link.classList.add('active');
  });
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const matchingLink = document.querySelector(`nav a[href="#${entry.target.id}"]`);
    if (!matchingLink) return;
    document.querySelectorAll('nav a').forEach((link) => link.classList.remove('active'));
    matchingLink.classList.add('active');
  });
}, { rootMargin: '-25% 0px -65% 0px' });

document.querySelectorAll('section[id]').forEach((section) => sectionObserver.observe(section));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function animateStats() {
  stats.forEach((stat) => {
    const target = Number(stat.dataset.count);
    const suffix = stat.dataset.suffix || '';
    const start = performance.now();
    const duration = 1000;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      stat.textContent = `${Math.floor(progress * target).toLocaleString('en-IN')}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  });
}

if ('IntersectionObserver' in window && stats.length) {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    animateStats();
    observer.disconnect();
  }, { threshold: 0.4 });
  statsObserver.observe(document.querySelector('.trust-stats'));
}

document.querySelectorAll('.hero-image img, .product-card img, .blog-card img').forEach((image) => {
  const markLoaded = () => image.classList.add('image-loaded');
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

if (heroImage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroImage.classList.add('parallax-image');
  window.addEventListener('scroll', () => {
    const offset = Math.min(window.scrollY * 0.08, 24);
    heroImage.style.setProperty('--parallax-offset', `${offset}px`);
  }, { passive: true });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => {
    item.classList.add('reveal-on-scroll');
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function saveCart() {
  localStorage.setItem('aquapure-cart', JSON.stringify(cart));
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = formatPrice(total);
  checkoutButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Add a product to get started.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div><strong>${item.name}</strong><span>${formatPrice(item.price)} each</span></div>
      <div class="quantity-control" aria-label="Quantity for ${item.name}">
        <button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${item.name} quantity">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" data-index="${index}" aria-label="Increase ${item.name} quantity">+</button>
      </div>
      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </div>
  `).join('');
}

function openCart() {
  if (typeof cartDialog.showModal === 'function') {
    cartDialog.showModal();
  } else {
    cartDialog.setAttribute('open', '');
  }
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const product = button.closest('.product-card');
    const name = product.dataset.product;
    const price = Number(product.dataset.price);
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToast(`${name} added to your cart.`);
    openCart();
  });
});

document.querySelector('#cart-trigger').addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', () => cartDialog.close());
document.querySelector('#home-order-button').addEventListener('click', () => {
  document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = cart[Number(button.dataset.index)];
  if (button.dataset.action === 'increase') item.quantity += 1;
  if (button.dataset.action === 'decrease') item.quantity -= 1;
  if (item.quantity <= 0) cart.splice(Number(button.dataset.index), 1);

  saveCart();
  renderCart();
});

checkoutButton.addEventListener('click', () => {
  const orderSummary = cart.map((item) => `${item.name} x${item.quantity}`).join(', ');
  document.querySelector('#contact-message').value = `I would like to order: ${orderSummary}.`;
  cartDialog.close();
  document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
  document.querySelector('#contact-name').focus({ preventScroll: true });
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const pincode = servicePincode.value.trim();

  if (!/^\d{6}$/.test(pincode)) {
    serviceStatus.textContent = 'Enter a valid 6-digit pincode so we can confirm delivery.';
    serviceStatus.className = 'service-error';
    servicePincode.focus();
    return;
  }

  if (deliveryDate.value < today) {
    formStatus.textContent = 'Choose today or a future delivery date.';
    formStatus.className = 'form-status service-error';
    deliveryDate.focus();
    return;
  }

  const orderReference = `AQ-${Date.now().toString().slice(-6)}`;
  formStatus.textContent = 'Thanks. Your request has been received. We will contact you shortly.';
  formStatus.textContent += ` Reference: ${orderReference}.`;
  formStatus.className = 'form-status success';
  event.target.reset();
  servicePincode.value = pincode;
  cart.length = 0;
  saveCart();
  renderCart();
});

document.querySelector('#check-service').addEventListener('click', () => {
  const pincode = servicePincode.value.trim();
  if (!/^\d{6}$/.test(pincode)) {
    serviceStatus.textContent = 'Enter a valid 6-digit pincode.';
    serviceStatus.className = 'service-error';
    return;
  }

  serviceStatus.textContent = 'Pincode received. We will confirm exact delivery availability with your order.';
  serviceStatus.className = 'service-success';
});

renderCart();

// 1. Language Support
const translations = {
  en: {
    nav_products: "Products",
    nav_blog: "Blog",
    nav_contact: "Contact",
    hero_eyebrow: "Hydration, delivered fresh",
    hero_title: "Pure water for every part of your day.",
    hero_desc: "Clean, safe, and refreshing packaged drinking water for home, work, and everywhere in between.",
    hero_btn: "Explore Products"
  },
  hi: {
    nav_products: "उत्पाद",
    nav_blog: "ब्लॉग",
    nav_contact: "संपर्क",
    hero_eyebrow: "ताज़ा हाइड्रेशन",
    hero_title: "आपके दिन के हर हिस्से के लिए शुद्ध पानी।",
    hero_desc: "घर, काम और हर जगह के लिए स्वच्छ, सुरक्षित और ताज़ा पैकेज्ड पेयजल।",
    hero_btn: "उत्पाद देखें"
  },
  mr: {
    nav_products: "उत्पादने",
    nav_blog: "ब्लॉग",
    nav_contact: "संपर्क",
    hero_eyebrow: "ताजे हायड्रेशन",
    hero_title: "तुमच्या दिवसाच्या प्रत्येक भागासाठी शुद्ध पाणी.",
    hero_desc: "घर, कार्यालय आणि इतर सर्व ठिकाणी स्वच्छ, सुरक्षित आणि ताजे पिण्याचे पाणी.",
    hero_btn: "उत्पादने पहा"
  }
};

const langSwitch = document.getElementById('lang-switch');
const i18nElements = document.querySelectorAll('[data-i18n]');
const savedLang = localStorage.getItem('aquapure-lang') || 'en';

if (langSwitch) {
  langSwitch.value = savedLang;
  applyLanguage(savedLang);

  langSwitch.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('aquapure-lang', lang);
    applyLanguage(lang);
  });
}

function applyLanguage(lang) {
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// 2. Savings Calculator
const jarSlider = document.getElementById('jar-slider');
if (jarSlider) {
  const jarCount = document.getElementById('jar-count');
  const stdCost = document.getElementById('standard-cost');
  const subCost = document.getElementById('sub-cost');
  const totalSavings = document.getElementById('total-savings');
  
  jarSlider.addEventListener('input', (e) => {
    const jarsPerWeek = parseInt(e.target.value, 10);
    jarCount.textContent = jarsPerWeek + (jarsPerWeek === 1 ? ' Jar' : ' Jars');
    
    // 52 weeks in a year
    const yearlyJars = jarsPerWeek * 52;
    const standardYearly = yearlyJars * 110;
    // 15% discount for monthly subscription
    const subYearly = yearlyJars * (110 * 0.85);
    
    stdCost.textContent = '₹' + standardYearly.toLocaleString('en-IN');
    subCost.textContent = '₹' + subYearly.toLocaleString('en-IN');
    totalSavings.textContent = '₹' + (standardYearly - subYearly).toLocaleString('en-IN');
  });
}

// 3. FAQ Search
const faqSearch = document.getElementById('faq-search');
if (faqSearch) {
  const faqs = document.querySelectorAll('.faq-list details');
  faqSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    faqs.forEach(faq => {
      const text = faq.textContent.toLowerCase();
      if (text.includes(query)) {
        faq.style.display = 'block';
      } else {
        faq.style.display = 'none';
      }
    });
  });
}

// 4. Newsletter Signup
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('nl-email');
    showToast('Subscribed! Check your email for your 10% discount code.');
    emailInput.value = '';
  });
}

// Ensure new sections get added to revealItems if they are present
const newSections = '.source-story, .calculator';
document.querySelectorAll(newSections).forEach(item => {
  // Try to find the revealItems observer logic, though for a quick patch we can just add a class
  item.classList.add('reveal-on-scroll');
  // It won't be tracked by the existing observer if it was bound early, so we force visibility or bind it manually.
  setTimeout(() => {
    item.classList.add('is-visible');
  }, 100);
});

// 1. Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 500); // Remove from DOM after fade
    }, 1000);
  }
});

// 2. Hero Pincode Check
const heroPincode = document.getElementById('hero-pincode');
const heroPincodeMsg = document.getElementById('hero-pincode-msg');
const validPincodes = ['400001', '400053', '400072', '401105']; // Mock list
if (heroPincode) {
  heroPincode.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val.length === 6) {
      if (validPincodes.includes(val)) {
        heroPincodeMsg.textContent = '✓ Excellent! We deliver to your area within 24 hours.';
        heroPincodeMsg.className = 'hero-pincode-msg success';
        heroPincode.style.borderColor = '#18794e';
      } else {
        heroPincodeMsg.textContent = 'Sorry, we do not deliver to this pincode yet.';
        heroPincodeMsg.className = 'hero-pincode-msg error';
        heroPincode.style.borderColor = '#d63031';
      }
    } else {
      heroPincodeMsg.textContent = '';
      heroPincodeMsg.className = 'hero-pincode-msg';
      heroPincode.style.borderColor = '';
    }
  });
}

// 3. Bundle Builder
const bundleState = { jar: 0, box: 0 };
const prices = { jar: 110, box: 450 };
const bundleBtns = document.querySelectorAll('.bundle-btn');
const jarQtyEl = document.getElementById('bundle-jar-qty');
const boxQtyEl = document.getElementById('bundle-box-qty');
const totalEl = document.getElementById('bundle-total');
const discountMsg = document.getElementById('bundle-discount-msg');
const checkoutBtn = document.getElementById('bundle-checkout-btn');

if (bundleBtns.length > 0) {
  bundleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.getAttribute('data-item');
      if (btn.classList.contains('plus')) {
        bundleState[item]++;
      } else if (btn.classList.contains('minus') && bundleState[item] > 0) {
        bundleState[item]--;
      }
      
      jarQtyEl.textContent = bundleState.jar;
      boxQtyEl.textContent = bundleState.box;
      
      let total = (bundleState.jar * prices.jar) + (bundleState.box * prices.box);
      const totalItems = bundleState.jar + bundleState.box;
      
      if (totalItems >= 3) {
        total = total * 0.95; // 5% discount
        discountMsg.textContent = '5% Bulk Discount Applied! 🎉';
        discountMsg.style.color = '#18794e';
      } else {
        discountMsg.textContent = 'Add ' + (3 - totalItems) + ' more item(s) to unlock a 5% discount!';
        discountMsg.style.color = '#e76f51';
      }
      
      totalEl.textContent = '₹' + total.toLocaleString('en-IN');
      checkoutBtn.disabled = total === 0;
    });
  });
  
  checkoutBtn.addEventListener('click', () => {
    showToast('Bundle added to cart! Proceeding to checkout...');
  });
}

// 4. Sales Toast Notifications
const salesToast = document.getElementById('sales-toast');
const salesToastText = document.getElementById('sales-toast-text');
const mockNames = ['Rahul from Andheri', 'Priya from Bandra', 'Amit from Thane', 'Sneha from Powai', 'Vikram from Colaba'];
const mockActions = ['just subscribed to the Monthly Plan!', 'just ordered a 20L Jar!', 'just built a custom bundle!', 'just claimed a referral bonus!'];

if (salesToast) {
  setInterval(() => {
    // 30% chance to show a toast every 15 seconds to not be too annoying
    if (Math.random() > 0.7) {
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
      
      salesToastText.textContent = `${randomName} ${randomAction} 🎉`;
      salesToast.classList.add('show');
      
      setTimeout(() => {
        salesToast.classList.remove('show');
      }, 4000);
    }
  }, 15000); // Check every 15s
}

// Add referral section to revealItems
document.querySelectorAll('.referral-content').forEach(item => {
  item.classList.add('reveal-on-scroll');
  setTimeout(() => {
    item.classList.add('is-visible');
  }, 100);
});

// 5. Hydration Quiz Logic
const quizSteps = document.querySelectorAll('.quiz-step');
const quizOptions = document.querySelectorAll('.quiz-option');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizResult = document.getElementById('quiz-result');
const quizRecommendation = document.getElementById('quiz-recommendation');
const quizResetBtn = document.getElementById('quiz-reset');
const quizAddBtn = document.getElementById('quiz-add-btn');

let currentStep = 1;
const userAnswers = {};

if (quizSteps.length > 0) {
  quizOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const value = e.target.getAttribute('data-value');
      userAnswers[`step${currentStep}`] = value;
      
      // Go to next step
      document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.remove('active');
      currentStep++;
      
      if (currentStep <= quizSteps.length) {
        document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.add('active');
        quizProgressBar.style.width = `${(currentStep / quizSteps.length) * 100}%`;
      } else {
        // Show result
        quizProgressBar.style.width = '100%';
        let plan = '';
        if (userAnswers.step1 === '6+' || userAnswers.step3 === 'office') {
          plan = '20L Jar (Weekly Subscription)';
          quizAddBtn.setAttribute('data-product', '20L Jar');
          quizAddBtn.setAttribute('data-price', '110');
        } else if (userAnswers.step2 === 'yes') {
          plan = 'Box of 500ml (24x) (Monthly)';
          quizAddBtn.setAttribute('data-product', 'Box of 500ml (24x)');
          quizAddBtn.setAttribute('data-price', '450');
        } else {
          plan = '1L Bottle (Monthly Subscription)';
          quizAddBtn.setAttribute('data-product', '1L Bottle');
          quizAddBtn.setAttribute('data-price', '35');
        }
        
        quizRecommendation.textContent = plan;
        quizResult.style.display = 'block';
      }
    });
  });

  quizResetBtn.addEventListener('click', () => {
    quizResult.style.display = 'none';
    currentStep = 1;
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.quiz-step[data-step="1"]').classList.add('active');
    quizProgressBar.style.width = '33%';
  });
  
  quizAddBtn.addEventListener('click', (e) => {
    const name = e.target.getAttribute('data-product') || 'Water Plan';
    const price = Number(e.target.getAttribute('data-price') || 110);
    cart.push({ name, price, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${name} added to your cart.`);
    openCart();
  });
}

// 6. Live Quality Report (Mock Fluctuation)
const liveTds = document.getElementById('live-tds');
const livePh = document.getElementById('live-ph');
if (liveTds && livePh) {
  setInterval(() => {
    // Fluctuate TDS between 42 and 48
    const newTds = Math.floor(Math.random() * (48 - 42 + 1)) + 42;
    liveTds.textContent = newTds;
    
    // Fluctuate pH between 7.3 and 7.5
    const newPh = (Math.random() * (7.5 - 7.3) + 7.3).toFixed(1);
    livePh.textContent = newPh;
  }, 3500); // Update every 3.5 seconds
}

// 7. Order Tracking Modal
const trackOrderTrigger = document.getElementById('track-order-trigger');
const trackingDialog = document.getElementById('tracking-dialog');
const trackingClose = document.getElementById('tracking-close');

if (trackOrderTrigger && trackingDialog) {
  trackOrderTrigger.addEventListener('click', () => {
    if (typeof trackingDialog.showModal === 'function') {
      trackingDialog.showModal();
    } else {
      trackingDialog.setAttribute('open', '');
    }
    
    // Mock progression animation when opened
    const steps = document.querySelectorAll('.tracking-step');
    steps.forEach(s => { s.classList.remove('completed', 'active'); });
    steps[0].classList.add('completed');
    steps[1].classList.add('completed');
    steps[2].classList.add('active');
  });
  
  trackingClose.addEventListener('click', () => {
    trackingDialog.close();
  });
}

// 8. Loyalty Points Logic
const cartRewards = document.getElementById('cart-rewards');
const earnedPoints = document.getElementById('earned-points');

// Hook into existing renderCart function using a monkey patch for the loyalty points
const originalRenderCart = renderCart;
renderCart = function() {
  originalRenderCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (total > 0 && cartRewards) {
    cartRewards.style.display = 'flex';
    // 1 point per 10 rupees spent
    earnedPoints.textContent = Math.floor(total / 10);
  } else if (cartRewards) {
    cartRewards.style.display = 'none';
  }
};
// Re-render once to apply points
renderCart();

// 9. Eco Counters Animation (Reuse stats observer)
const ecoStats = document.querySelectorAll('[data-eco-count]');
function animateEcoStats() {
  ecoStats.forEach((stat) => {
    const target = Number(stat.dataset.ecoCount);
    const suffix = stat.dataset.suffix || '';
    const start = performance.now();
    const duration = 1500;
    
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      stat.textContent = `${Math.floor(progress * target).toLocaleString('en-IN')}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  });
}

if ('IntersectionObserver' in window && ecoStats.length) {
  const ecoObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    animateEcoStats();
    observer.disconnect();
  }, { threshold: 0.4 });
  ecoObserver.observe(document.querySelector('.sustainability'));
}
