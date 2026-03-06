<?php
session_start();

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$conn = new mysqli("localhost", "root", "", "metafan");

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$messaggio = "";

/* PRENDO TUTTE LE TABELLE DAL DATABASE */
$result = $conn->query("SHOW TABLES");
$tabelle = [];

while ($row = $result->fetch_array()) {
    $tabelle[] = $row[0];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $tabella = $_POST["tabella"];

    if (in_array($tabella, $tabelle)) {

        // backtick per sicurezza
        $sql = "DROP TABLE `$tabella`";

        if ($conn->query($sql) === TRUE) {
            $messaggio = "La relazione '$tabella' è stata eliminata con successo.";
        } else {
            $messaggio = "Errore: " . $conn->error;
        }

    } else {
        $messaggio = "Tabella non valida.";
    }
}

$conn->close();
?>

<html>
<head>
    <title>Elimina Relazione - MetaFan</title>
</head>
<body>

<h1>Elimina una Relazione</h1>

<p>Seleziona la tabella da eliminare:</p>

<form method="POST">

    <select name="tabella" required>
        <option value="">-- Seleziona --</option>
        <?php
        foreach ($tabelle as $t) {
            echo "<option value='$t'>$t</option>";
        }
        ?>
    </select>

    <br><br>

    <input type="submit" value="Elimina"
        onclick="return confirm('Sei sicuro di voler eliminare questa relazione?');">

</form>

<br>

<p style="color:red;">
    <?php echo $messaggio; ?>
</p>

<br>
<a href="main.php">Torna indietro</a>

</body>
</html>