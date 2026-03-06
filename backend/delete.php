<?php
require "config.php";
session_start();

if(!isset($_SESSION['username'])){
    header("Location: login.php");
    exit;
}

// prendo tutte le tabelle
$stmt = $conn->query("SHOW TABLES");
$tabelle = $stmt->fetchAll(PDO::FETCH_COLUMN);

$messaggio = "";

// ----------------------
// ELIMINAZIONE RECORD
// ----------------------
if(isset($_POST['elimina'])){

    $tabella = $_POST['tabella'];
    $id = $_POST['id_record'];

    // prendo chiave primaria
    $stmt_pk = $conn->query("SHOW KEYS FROM `$tabella` WHERE Key_name='PRIMARY'");
    $primary = $stmt_pk->fetch(PDO::FETCH_ASSOC)['Column_name'];

    try{
        $sql = "DELETE FROM `$tabella` WHERE `$primary` = ?";
        $stmt_delete = $conn->prepare($sql);
        $stmt_delete->execute([$id]);

        header("Location: delete.php?success=1&tabella=".$tabella);
        exit;

    } catch(PDOException $e){
        $messaggio = "Errore: " . $e->getMessage();
    }
}

// messaggio dopo redirect
if(isset($_GET['success'])){
    $messaggio = "La riga è stata eliminata correttamente.";
}
?>

<html>
<head>
    <title>Elimina dati - MetaFan</title>
</head>
<body>

<h1>Elimina dati dal DataBase</h1>

<a href="main.php">Torna indietro</a><br><br>

<form method="post" action="">
    <label>Seleziona tabella:</label>
    <select name="tabella" onchange="this.form.submit()">
        <option value="">-- scegli tabella --</option>
        <?php
        foreach($tabelle as $t){
            $selected = (isset($_GET['tabella']) && $_GET['tabella']==$t) ||
                        (isset($_POST['tabella']) && $_POST['tabella']==$t) ? "selected" : "";
            echo "<option value='$t' $selected>$t</option>";
        }
        ?>
    </select>
</form>

<?php
$tabella_selezionata = $_GET['tabella'] ?? $_POST['tabella'] ?? "";

if($tabella_selezionata != ""){

    // prendo chiave primaria
    $stmt_pk = $conn->query("SHOW KEYS FROM `$tabella_selezionata` WHERE Key_name='PRIMARY'");
    $primary = $stmt_pk->fetch(PDO::FETCH_ASSOC)['Column_name'];

    // prendo dati
    $stmt_dati = $conn->query("SELECT * FROM `$tabella_selezionata`");
    $rows = $stmt_dati->fetchAll(PDO::FETCH_ASSOC);

    if(!empty($rows)){
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr>";

        foreach(array_keys($rows[0]) as $col){
            echo "<th>$col</th>";
        }
        echo "<th>Elimina</th>";
        echo "</tr>";

        foreach($rows as $row){
            echo "<tr>";

            foreach($row as $value){
                echo "<td>".htmlspecialchars($value)."</td>";
            }

            echo "<td>
                    <form method='post' action='' 
                          onsubmit=\"return confirm('Sei sicuro di voler eliminare questa riga?');\">
                        <input type='hidden' name='tabella' value='$tabella_selezionata'>
                        <input type='hidden' name='id_record' value='".$row[$primary]."'>
                        <button type='submit' name='elimina' style='color:red;'>Elimina</button>
                    </form>
                  </td>";

            echo "</tr>";
        }

        echo "</table>";
    } else {
        echo "<p>Nessun dato presente.</p>";
    }

    // ----------------------
    // MESSAGGIO
    // ----------------------
    if($messaggio){
        echo "<p id='messaggio-conferma' 
              style='color:green; font-weight:bold;'>
              $messaggio
              </p>";
    }
}
?>

<script>
setTimeout(function() {
    var msg = document.getElementById("messaggio-conferma");
    if(msg){
        msg.style.transition = "opacity 0.5s";
        msg.style.opacity = "0";
        setTimeout(function(){
            msg.remove();
        }, 500);
    }
}, 3000);
</script>

</body>
</html>
