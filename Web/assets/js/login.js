const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('message');
const loadingScreen = document.getElementById('loadingScreen');

function showMessage(text) {
  loginMessage.textContent = text;
  loginMessage.className = 'form-message error';
}

async function loadProductImages() {
  loadingScreen.hidden = false;

  try {
    const response = await fetch('./api/cashier/products/products.php');

    if (!response.ok) throw new Error('Failed to fetch products');

    const products = await response.json();

    await preloadImages(products.map(product => product.image));
  } catch (error) {
    console.error(error);
  }
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();

  const button = loginForm.querySelector('input[type="submit"]');

  button.disabled = true;
  loginMessage.textContent = '';

  try {
    const response = await fetch('./auth/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      })
    });

    const data = await response.json();

    if (!data.success) {
      showMessage(data.message);
      return;
    }

    await loadProductImages();

    location.href = data.redirect;

  } catch (error) {
    showMessage('Unable to log in. Please try again.');
  } finally {
    button.disabled = false;
  }
});
