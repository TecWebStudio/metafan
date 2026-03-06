<?php
session_start();

// If already logged in, redirect to dashboard
if (isset($_SESSION['username'])) {
    header("Location: dashboard.php");
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === 'metafan' && $password === 'metapassword') {
        $_SESSION['username'] = $username;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Nome utente o password errati.";
    }
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — MetaFan Management</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

  <div class="login-page">
    <!-- Background elements -->
    <div class="hero-grid-pattern" style="position:absolute;inset:0;opacity:.3"></div>

    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">MF</div>
        <h2>Area Gestione</h2>
        <p>Accedi al pannello di gestione MetaFan</p>
      </div>

      <?php if ($error): ?>
        <div class="login-error">
          <i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form method="post" action="" class="login-form">
        <div class="form-group">
          <label class="form-label">Nome Utente</label>
          <input type="text" name="username" class="form-input" placeholder="Inserisci il nome utente" required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-input" placeholder="Inserisci la password" required>
        </div>

        <button type="submit" class="btn btn-primary btn-lg">
          <i class="fas fa-sign-in-alt"></i> Accedi
        </button>
      </form>

      <div class="login-footer">
        <a href="index.html"><i class="fas fa-arrow-left"></i> Torna al Sito</a>
      </div>
    </div>
  </div>

</body>
</html>
