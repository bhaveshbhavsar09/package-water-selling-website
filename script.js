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
