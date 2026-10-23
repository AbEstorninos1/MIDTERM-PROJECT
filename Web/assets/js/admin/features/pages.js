const sidebarButtons = document.querySelectorAll('.sidebar-btn[data-target]');
const pageTitle = document.getElementById('pageTitle');

const adminPages = [
  'dashboard',
  'account-management',
  'transaction-history',
  'inventory'
];

let currentAdminPage = 'dashboard';

function showAdminPage(target) {
  currentAdminPage = target;

  adminPages.forEach(id => {
    const section = document.getElementById(id);

    if (section) {
      section.hidden = id !== target;
    } else {
      console.warn(`Missing section: ${id}`);
    }
  });

  sidebarButtons.forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.target === target
    );
  });

  const titles = {
    dashboard: 'Dashboard',
    'account-management': 'Manage Account',
    'transaction-history': 'Transaction History',
    inventory: 'Inventory'
  };

  pageTitle.textContent = titles[target] ?? 'Dashboard';

  if (target === 'transaction-history') loadTransactions();
  if (target === 'account-management') loadAccounts();
  if (target === 'inventory') loadInventory();
}

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    showAdminPage(button.dataset.target);
  });
});

showAdminPage('dashboard');

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (await askModal('Are you sure you want to logout?', 'Logout', 'Logout?')) {
    location.href = '../auth/logout.php';
  }
});

// Realtime: refresh the page that is open when something changes
const realtimeLoaders = {
  sale: {
    dashboard: () => loadDashboard(),
    'transaction-history': () => loadTransactions(false),
    inventory: () => loadInventory()
  },
  inventory: {
    dashboard: () => loadDashboard(),
    inventory: () => loadInventory()
  },
  account: {
    'account-management': () => loadAccounts()
  }
};

connectRealtime(message => {
  const loader = realtimeLoaders[message.event]?.[currentAdminPage];

  if (loader) loader();
});
