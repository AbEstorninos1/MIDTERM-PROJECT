  function confirmLogout() {
    showModal('Logout?', () => {
      location.href = '../auth/logout.php';
    });
  }

// Realtime: another cashier or the admin changed something
connectRealtime(message => {
  if (message.event === 'sale' || message.event === 'inventory') {
    reloadProducts().catch(() => {});
  }

  if (message.event === 'sale') {
    fetchRecords().then(renderRecords).catch(() => {});
  }
});
