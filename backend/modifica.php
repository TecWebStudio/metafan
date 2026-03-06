<?php
require "config.php";
session_start();

$messaggio = '';

if(!isset($_SESSION['username'])) {
    header("location: login.php");
    exit;
}

// prendo tutte le tabelle
$tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM);

if(isset($_POST['tabella']) && $_POST['tabella'] != ''){

    $tabella = $_POST['tabella'];

    // PRENDO TUTTE LE COLONNE DELLA CHIAVE PRIMARIA (anche composta)
    $stmt_pk = $conn->query("SHOW KEYS FROM `$tabella` WHERE Key_name='PRIMARY'");
    $primary_keys = $stmt_pk->fetchAll(PDO::FETCH_ASSOC);

    $primary = [];
    foreach($primary_keys as $pk){
        $primary[] = $pk['Column_name'];
    }

    // SALVATAGGIO MODIFICHE
    if(isset($_POST['salva_tutto']) && isset($_POST['id_record'])){

        $stmt_col = $conn->query("DESCRIBE `$tabella`");
        $colonne = $stmt_col->fetchAll(PDO::FETCH_ASSOC);

        foreach($_POST['id_record'] as $id_key){

            $updates = [];
            $values = [];

            foreach($colonne as $col){

                $field = $col['Field'];

                // NON aggiorno chiavi primarie
                if(in_array($field, $primary)) continue;

                $updates[] = "`$field` = ?";
                $values[] = $_POST[$field][$id_key] ?? null;
            }

            // COSTRUISCO WHERE PER PK (anche composta)
            $where = [];
            $pk_values = explode("|", $id_key);

            foreach($primary as $index => $pk){
                $where[] = "`$pk` = ?";
                $values[] = $pk_values[$index];
            }

            $sql = "UPDATE `$tabella` 
                    SET ".implode(",", $updates)." 
                    WHERE ".implode(" AND ", $where);

            $stmt_update = $conn->prepare($sql);
            $stmt_update->execute($values);
        }

        $messaggio = "La modifica è stata effettuata correttamente.";
    }

    // MOSTRO DATI
    $stmt_dati = $conn->query("SELECT * FROM `$tabella`");
    $rows = $stmt_dati->fetchAll(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Modifica dati</title>
</head>
<body>

<h1>Modifica i dati del tuo DataBase</h1>

<a href="main.php">Torna indietro</a><br><br>

<form method="post">
<label>Seleziona tabella:</label>
<select name="tabella" onchange="this.form.submit()">
<option value="">-- scegli tabella --</option>
<?php foreach($tables as $t):
    $selected = (isset($tabella) && $tabella==$t[0]) ? "selected" : "";
?>
<option value="<?= $t[0] ?>" <?= $selected ?>><?= $t[0] ?></option>
<?php endforeach; ?>
</select>
</form>

<?php if(isset($rows) && !empty($rows)): ?>

<form method="post">
<input type="hidden" name="tabella" value="<?= $tabella ?>">

<table border="1" cellpadding="5" cellspacing="0">

<tr>
<?php foreach(array_keys($rows[0]) as $col): ?>
<th><?= $col ?></th>
<?php endforeach; ?>
</tr>

<?php foreach($rows as $row): ?>
<tr>

<?php
// creo chiave primaria composta come stringa unica
$pk_value = [];
foreach($primary as $pk){
    $pk_value[] = $row[$pk];
}
$pk_string = implode('|', $pk_value);
?>

<input type="hidden" name="id_record[]" value="<?= $pk_string ?>">

<?php foreach($row as $k=>$v): ?>
<td>
<?php if(in_array($k, $primary)): ?>
    <?= htmlspecialchars($v) ?>
<?php else: ?>
    <input type="text" 
           name="<?= $k ?>[<?= $pk_string ?>]" 
           value="<?= htmlspecialchars($v) ?>">
<?php endif; ?>
</td>
<?php endforeach; ?>

</tr>
<?php endforeach; ?>

</table>

<br>
<button type="submit" name="salva_tutto">Salva tutte le modifiche</button>

</form>

<?php endif; ?>


<?php if($messaggio): ?>
<p id="messaggio-conferma" style="color:green; font-weight:bold;">
    <?= $messaggio ?>
</p>
<?php endif; ?>


<script>
// Nascondo messaggio dopo 3 secondi
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