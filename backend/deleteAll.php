<?php
require "config.php";
session_start();

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$messaggio = "";

/* PRENDO TUTTE LE TABELLE DAL DATABASE */
$result = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
$tabelle = $result->fetchAll(PDO::FETCH_COLUMN);

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $tabella = $_POST["tabella"];

    if (in_array($tabella, $tabelle)) {

        // backtick per sicurezza
        $safe_tab = sanitizeTableName($tabella);
        $sql = "DROP TABLE \"$safe_tab\"";

        try {
            $conn->exec($sql);
            $messaggio = "La relazione '$tabella' è stata eliminata con successo.";
        } catch (PDOException $e) {
            $messaggio = "Errore: " . $e->getMessage();
        }

    } else {
        $messaggio = "Tabella non valida.";
    }
}
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