<?php
    $host = "localhost";
    $dbname = "metafan";
    $user = "root";
    $pass = "";
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e){  //cattura l'errore se c'è
        die("Errore di connessione al database: " . $e->getMessage());  //stampa mes e ferma codice
    }

    //PDO è una libreria per connettersi al DB
?>