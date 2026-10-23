const accountTableBody = document.getElementById('accountTableBody');
const addAccountBtn = document.querySelector('.addAccountbtn');

let accountList = [];

function getAccountActions(account) {
  const id = Number(account.id);
  const button = (cls, action, label) =>
    `<button type="button" class="${cls}" data-action="${action}" data-id="${id}">${label}</button>`;

  const buttons = [];
  const removeButton = button('removeAccountbtn', 'remove', 'Remove');

  if (account.status === 'Pending') {
    buttons.push(button('approveAccountbtn', 'approve', 'Approve'));
    buttons.push(button('rejectAccountbtn', 'reject', 'Reject'));
  } else {
    buttons.push(button('editAccountbtn', 'edit', 'Edit'));

    if (account.status === 'Active') {
      buttons.push(button('disableAccountbtn', 'disable', 'Disable'));
    } else {
      buttons.push(button('enableAccountbtn', 'enable', account.status === 'Rejected' ? 'Approve' : 'Enable'));
    }
  }

  buttons.push(removeButton);

  return `<div class="account-actions">${buttons.join('')}</div>`;
}

function renderAccounts(accounts) {
  accountList = accounts;

  accountTableBody.innerHTML = accounts.map(account => `
    <tr>
      <td>${Number(account.id)}</td>
      <td>${escapeHTML(account.username)}</td>
      <td>${escapeHTML(account.role)}</td>
      <td><span class="status ${escapeHTML(account.status.toLowerCase())}">${escapeHTML(account.status)}</span></td>
      <td>${escapeHTML(account.created_at)}</td>
      <td>${getAccountActions(account)}</td>
    </tr>
  `).join('');
}

async function loadAccounts() {
  try {
    renderAccounts(await fetchAccounts());
  } catch (error) {
    console.error('Failed to load accounts:', error);

    accountTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:30px;">
          Failed to load accounts
        </td>
      </tr>
    `;
  }
}

function openAccountModal() {
  createModal('Add Account', `
    <input type="text" name="username" placeholder="Username" minlength="3" maxlength="30" required>
    <input type="password" name="password" placeholder="Password (at least 6 characters)" minlength="6" required>

    <select name="role">
      <option value="Cashier">Cashier</option>
      <option value="Admin">Admin</option>
    </select>

    <p class="modal-error"></p>
  `, async (formData, form) => {
    const result = await createAccount(
      formData.get('username'),
      formData.get('password'),
      formData.get('role')
    );

    if (!result.success) {
      form.querySelector('.modal-error').textContent = result.message;
      return false;
    }

    await loadAccounts();
  });
}

addAccountBtn.addEventListener('click', openAccountModal);

function openEditAccountModal(account) {
  createModal('Edit Account', `
    <label class="field">
      <span>Username</span>
      <input type="text" name="username" value="${escapeHTML(account.username)}" minlength="3" maxlength="30" required>
    </label>

    <label class="field">
      <span>New password (leave empty to keep the current one)</span>
      <input type="password" name="password" placeholder="At least 6 characters" minlength="6">
    </label>

    <label class="field">
      <span>Role</span>
      <select name="role">
        <option value="Cashier" ${account.role === 'Cashier' ? 'selected' : ''}>Cashier</option>
        <option value="Admin" ${account.role === 'Admin' ? 'selected' : ''}>Admin</option>
      </select>
    </label>

    <p class="modal-error"></p>
  `, async (formData, form) => {
    const result = await updateAccount({
      id: account.id,
      action: 'edit',
      username: formData.get('username'),
      password: formData.get('password'),
      role: formData.get('role')
    });

    if (!result.success) {
      form.querySelector('.modal-error').textContent = result.message;
      return false;
    }

    await loadAccounts();
  });
}

accountTableBody.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const account = accountList.find(item => Number(item.id) === Number(button.dataset.id));
  if (!account) return;

  const action = button.dataset.action;

  if (action === 'edit') {
    openEditAccountModal(account);
    return;
  }

  const questions = {
    reject: `Reject the registration of "${account.username}"?`,
    disable: `Disable "${account.username}"? They will not be able to log in.`,
    remove: `Remove "${account.username}" permanently? This cannot be undone.`
  };

  const confirmText = { reject: 'Reject', disable: 'Disable', remove: 'Remove' };

  if (questions[action] && !(await askModal(questions[action], confirmText[action]))) return;

  button.disabled = true;

  try {
    const result = await updateAccount({ id: account.id, action });

    if (result.success) successModal(result.message || 'The account was updated.');
    else errorModal(result.message);
  } catch (error) {
    errorModal('Unable to update the account. Please try again.');
  }

  await loadAccounts();
});
