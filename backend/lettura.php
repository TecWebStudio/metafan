<?php
require "config.php"; // qui c'è la connessione PDO
?>

<html lang="it">
<head>
    <title>Seleziona Tabella - MetaFan</title>
</head>
<body>

<h1>MetaFan Industry - Visualizza tabella</h1>

<a href="main.php">Torna indietro</a><br><br>

<form method="get" action="">
    <label for="tabella">Seleziona tabella:</label>

    

    <select name="tabella" id="tabella">
        <option value="">-- Scegli una tabella --</option>

        <?php
        // Prendo tutte le tabelle
        $stmt = $conn->query("SHOW TABLES");
        while ($tab = $stmt->fetch(PDO::FETCH_NUM)) {
            $nome_tab = $tab[0];
            // Mantengo selezionata la tabella scelta
            $selected = (isset($_GET['tabella']) && $_GET['tabella'] == $nome_tab) ? "selected" : "";
            echo "<option value='$nome_tab' $selected>$nome_tab</option>";
        }
        ?>
    </select>
    <button type="submit">Mostra</button>
</form>

<?php
if (isset($_GET['tabella']) && !empty($_GET['tabella'])) {
    $nome_tabella = $_GET['tabella'];

    // Prendo le colonne
    $colonne = [];
    $stmt_col = $conn->query("DESCRIBE `$nome_tabella`");
    while ($col = $stmt_col->fetch(PDO::FETCH_ASSOC)) {
        $colonne[] = $col['Field'];
    }

    // Prendo i dati
    $stmt_dati = $conn->query("SELECT * FROM `$nome_tabella`");

    if ($stmt_dati->rowCount() == 0) {
        echo "<p>Nessun dato presente nella tabella <strong>$nome_tabella</strong>.</p>";
    } else {
        echo "<h2>Tabella: $nome_tabella</h2>";
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr>";
        foreach ($colonne as $c) {
            echo "<th>$c</th>";
        }
        echo "</tr>";

        while ($row = $stmt_dati->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            foreach ($colonne as $c) {
                echo "<td>" . htmlspecialchars($row[$c]) . "</td>";
            }
            echo "</tr>";
        }

        echo "</table>";
    }
}
?>


</body>
</html>
