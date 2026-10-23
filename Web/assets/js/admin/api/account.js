async function fetchAccounts() {
  const response = await fetch('../api/admin/account/account.php', {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

async function createAccount(username, password, role) {
  const response = await fetch('../api/admin/account/create-account.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });

  return response.json();
}

async function updateAccount(payload) {
  const response = await fetch('../api/admin/account/update-account.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.json();
}
