<?php
session_start();

//se l'utente non è loggato, rimandalo al login
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}
?>

<html>
<head>
    <title>Pagina Principale - MetaFan</title>
</head>
<body>

<h1>Benvenuto, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1>

<p>Da qui puoi gestire il tuo database:</p>

<ul>
    <li><a href="lettura.php">Visualizza Dati</a></li>
    <li><a href="aggiungi.php">Aggiungi Dati</a></li>
    <li><a href="modifica.php">Modifica Dati</a></li>
    <li><a href="delete.php">Elimina Record</a></li>
    <li><a href="deleteAll.php">Elimina Relazione</a></li>
    <li><a href="logout.php">Logout</a></li>
</ul>

</body>
</html>
