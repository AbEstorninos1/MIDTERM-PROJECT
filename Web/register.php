<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Sign Up</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="./assets/css/register.css">
</head>

<body>

  <div class="register-container">
    <div class="register-box">

      <header>
        <h4>Sign Up to</h4>
        <p>Arnel Aviles HardWare</p>
      </header>

      <form id="registerForm">

        <input
          type="text"
          id="username"
          placeholder="Username"
          required
        >

        <input
          type="password"
          id="password"
          placeholder="Password"
          required
        >

        <input
          type="password"
          id="confirm"
          placeholder="Confirm password"
          required
        >

        <p id="message" class="form-message"></p>

        <input
          type="submit"
          value="Sign Up"
        >

      </form>

      <div class="create-account">
        Already have an account?
        <a href="./index.php">Login here</a>
      </div>

    </div>
  </div>

  <script src="./assets/js/register.js"></script>

</body>
</html>