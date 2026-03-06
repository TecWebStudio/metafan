<?php
session_start();

// se l'utente è già loggato, va alla pagina principale
if (isset($_SESSION['username'])) { 
    header("Location: main.php"); // <-- cambio qui
    exit;
}

// controllo login dell'utente
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // verifico che le credenziali siano corrette
    if ($username === 'metafan' && $password === 'metapassword') {
        $_SESSION['username'] = $username; // salvo sessione
        header("Location: main.php");      // reindirizzo alla pagina principale
        exit;
    } else {
        $error = "Nome utente o password errati!";
    }
}
?>

<html>
<head>
    <title>Login - MetaFan</title>
</head>
<body>

<h1>Login MetaFan</h1>

<?php if ($error) echo "<p style='color:red;'>$error</p>"; ?>

<form method="post" action="">
    <label for="username">Nome utente:</label>
    <input type="text" name="username" id="username" required><br><br>

    <label for="password">Password:</label>
    <input type="password" name="password" id="password" required><br><br>

    <button type="submit">Accedi</button>
</form>

</body>
</html>
