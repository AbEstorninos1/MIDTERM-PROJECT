<?php

session_start();
require_once __DIR__ . '/config/database.php';
header('Content-Type: text/html; charset=utf-8');
restoreLogin($conn);

if (isset($_SESSION['user'])) {
  header('Location: ' . ($_SESSION['user']['role'] === 'Admin' ? './admin/dashboard.php' : './cashier/pos.php'));
  exit;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
  <div class="login-container">
    <div class="login-box">
      <header>
        <h4>Sign In to</h4>
        <p>Arnel Aviles HardWare</p>
      </header>

      <form id="loginForm">
        <input type="text" id="username" placeholder="Username" required>
        <input type="password" id="password" placeholder="Password" required>
        <p id="message" class="form-message"></p>
        <input type="submit" value="Sign In">
      </form>

      <div class="create-account">
        Create an Account?<a href="./register.php">Create Account</a>
      </div>
    </div>
  </div>

  <div class="loading-screen" id="loadingScreen" hidden>
    <div class="loader"></div>
  </div>

  <script>window.APP_ROOT = './';</script>
  <script src="./assets/js/shared/imageCache.js"></script>
  <script src="./assets/js/login.js"></script>
</body>
</html>
