const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('message');

function setMessage(text, type) {
  registerMessage.textContent = text;
  registerMessage.className = 'form-message ' + type;
}

registerForm.addEventListener('submit', async event => {
  event.preventDefault();

  const password = document.getElementById('password').value;

  if (password !== document.getElementById('confirm').value) {
    setMessage('Passwords do not match.', 'error');
    return;
  }

  const button = registerForm.querySelector('input[type="submit"]');

  button.disabled = true;

  try {
    const response = await fetch('./auth/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: password
      })
    });

    const data = await response.json();

    if (!data.success) {
      setMessage(data.message, 'error');
      return;
    }

    setMessage(data.message, 'success');
    setTimeout(() => { location.href = './index.php'; }, 1200);

  } catch (error) {
    setMessage('Unable to sign up. Please try again.', 'error');
  } finally {
    button.disabled = false;
  }
});
