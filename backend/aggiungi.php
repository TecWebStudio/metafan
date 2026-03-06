<?php
require "config.php";
session_start();

// prendo tutte le tabelle
$stmt = $conn->query("SHOW TABLES");
$tabelle = $stmt->fetchAll(PDO::FETCH_COLUMN);

$messaggio = "";

// ----------------------
// GESTIONE INSERIMENTO
// ----------------------
if(isset($_POST['aggiungi'])) {

    $tabella = $_POST['tabella'];
    $campi = [];
    $valori = [];

    $stmt_col = $conn->query("DESCRIBE `$tabella`");
    $colonne = $stmt_col->fetchAll(PDO::FETCH_COLUMN);

    foreach($colonne as $col){
        if(isset($_POST[$col]) && $_POST[$col] !== "") {
            $campi[] = "`$col`";
            $valori[] = $_POST[$col];
        }
    }

    if(count($campi) > 0){

        $placeholders = rtrim(str_repeat("?,", count($valori)), ",");
        $sql = "INSERT INTO `$tabella` (".implode(",", $campi).") VALUES ($placeholders)";
        $stmt_insert = $conn->prepare($sql);

        try{
            $stmt_insert->execute($valori);

            // redirect professionale
            header("Location: aggiungi.php?success=1&tabella=".$tabella);
            exit;

        } catch(PDOException $e){
            $messaggio = "Errore: " . $e->getMessage();
        }
    }
}

// messaggio dopo redirect
if(isset($_GET['success'])){
    $messaggio = "I dati sono stati inseriti correttamente.";
}

// ----------------------
// CHIAVI ESTERNE
// ----------------------
$foreign_keys = [];
$stmt_fk = $conn->query("
    SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
");

foreach($stmt_fk->fetchAll(PDO::FETCH_ASSOC) as $fk){
    $foreign_keys[$fk['TABLE_NAME']][$fk['COLUMN_NAME']] = [
        'tabella'=>$fk['REFERENCED_TABLE_NAME'],
        'colonna'=>$fk['REFERENCED_COLUMN_NAME']
    ];
}
?>

<html>
<head>
    <title>Aggiungi dati - MetaFan</title>
</head>
<body>

<h1>Aggiungi qui i dati nel DataBase</h1>

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

    $stmt_col = $conn->query("DESCRIBE `$tabella_selezionata`");
    $colonne = $stmt_col->fetchAll(PDO::FETCH_COLUMN);

    echo "<form method='post' action=''>";
    echo "<input type='hidden' name='tabella' value='$tabella_selezionata'>";

    foreach($colonne as $col){

        echo "<label>$col:</label>";

        if(isset($foreign_keys[$tabella_selezionata][$col])){

            $ref_tab = $foreign_keys[$tabella_selezionata][$col]['tabella'];
            $ref_col = $foreign_keys[$tabella_selezionata][$col]['colonna'];

            $stmt_ref = $conn->query("SELECT * FROM `$ref_tab`");
            $righe_ref = $stmt_ref->fetchAll(PDO::FETCH_ASSOC);

            echo "<select name='$col'>";
            foreach($righe_ref as $r){
                $val = $r[$ref_col];
                $label = $r['Nome'] ?? $r['Ragione_Sociale'] ?? $val;
                echo "<option value='$val'>$val - $label</option>";
            }
            echo "</select><br>";

        } else {
            echo "<input type='text' name='$col'><br>";
        }
    }

    echo "<br><button type='submit' name='aggiungi'>Aggiungi</button>";
    echo "</form>";

    // ----------------------
    // MESSAGGIO DI CONFERMA
    // ----------------------
    if($messaggio){
        echo "<p id='messaggio-conferma' 
              style='color:green; font-weight:bold;'>
              $messaggio
              </p>";
    }
}
?>

<!-- SCRIPT SCOMPARSA DOPO 3 SECONDI -->
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
