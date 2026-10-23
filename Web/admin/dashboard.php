<?php
session_start();
require_once __DIR__ . '/../config/database.php';
header('Content-Type: text/html; charset=utf-8');
restoreLogin($conn);

if (($_SESSION['user']['role'] ?? '') !== 'Admin') {
  header('Location: ../index.php');
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>

  <link rel="stylesheet" href="../assets/css/admin/modal.css">
  <link rel="stylesheet" href="../assets/css/admin/style.css">
  <link rel="stylesheet" href="../assets/css/admin/account.css">
  <link rel="stylesheet" href="../assets/css/admin/transaction.css">
  <link rel="stylesheet" href="../assets/css/admin/inventory.css">
</head>
<body>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <h2 class="sidebar-title">Admin</h2>

      <nav class="sidebar-nav">
        <button type="button" class="sidebar-btn active" data-target="dashboard">
          DASHBOARD
        </button>

        <button type="button" class="sidebar-btn" data-target="account-management">
          MANAGE ACCOUNT
        </button>

        <button type="button" class="sidebar-btn" data-target="transaction-history">
          TRANSACTION
        </button>

        <button type="button" class="sidebar-btn" data-target="inventory">
          INVENTORY
        </button>

      </nav>

      <div class="sidebar-bottom">
        <p class="sidebar-user">Logged in as <strong><?= htmlspecialchars($_SESSION['user']['username']) ?></strong></p>
        <button type="button" class="sidebar-btn logout" id="logoutBtn">LOGOUT</button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1 id="pageTitle">Dashboard</h1>
      </header>

      <?php include '../pages/admin/dashboard.php'; ?>
      <?php include '../pages/admin/account.php'; ?>
      <?php include '../pages/admin/transaction.php'; ?>
      <?php include '../pages/admin/inventory.php'; ?>
    </main>
  </div>

  <script>window.APP_ROOT = '../';</script>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

  <script src="../assets/js/shared/utils.js"></script>
  <script src="../assets/js/shared/imageCache.js"></script>
  <script src="../assets/js/admin/features/modal.js"></script>

  <script src="../assets/js/admin/features/dashboard.js"></script>
  <script src="../assets/js/admin/api/dashboard.js"></script>

  <script src="../assets/js/admin/api/account.js"></script>
  <script src="../assets/js/admin/features/account.js"></script>

  <script src="../assets/js/admin/api/transaction.js"></script>
  <script src="../assets/js/admin/features/transaction.js"></script>

  <script src="../assets/js/admin/api/inventory.js"></script>
  <script src="../assets/js/admin/features/inventory.js"></script>

  <script src="../assets/js/admin/features/pages.js"></script>
</body>
</html>
