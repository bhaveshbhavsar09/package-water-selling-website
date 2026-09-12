const cart = JSON.parse(localStorage.getItem('aquapure-cart') || '[]');
const cartDialog = document.querySelector('#cart-dialog');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const formStatus = document.querySelector('#form-status');

const formatPrice = (value) => `₹${value.toLocaleString('en-IN')}`;

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
  formStatus.textContent = 'Thanks. Your request has been received. We will contact you shortly.';
  formStatus.className = 'form-status success';
  event.target.reset();
});

renderCart();
