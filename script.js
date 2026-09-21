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

const revealItems = document.querySelectorAll(
  '.about, .benefits, .delivery-steps, .products, .blog, .faq, .contact, .policies, .trust-stats, .benefit-item, .step-item, .product-card, .blog-card, .faq details, .policy-grid details'
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
