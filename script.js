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

const revealItems = document.querySelectorAll(
  '.about, .benefits, .delivery-steps, .products, .faq, .contact, .policies, .benefit-item, .step-item, .product-card, .faq details, .policy-grid details'
);

const formatPrice = (value) => `₹${value.toLocaleString('en-IN')}`;
const today = new Date().toISOString().split('T')[0];
deliveryDate.min = today;

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
