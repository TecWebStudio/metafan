<?php
/**
 * ordine_dettaglio.php — Recupera dettaglio singolo ordine con dati arricchiti
 * 
 * Parametri GET:
 *   - id: ID dell'ordine di produzione
 * 
 * Richiede autenticazione (session-based).
 * Risponde in JSON.
 */
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Non autorizzato']);
    exit;
}

require 'config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'ID ordine non valido']);
    exit;
}

try {
    // Query singolo ordine con confronto rispetto alla media della stessa macchina
    $sql = "
        SELECT
            o.*,
            ROUND(
                (1.0 - o.consumo_kwh / NULLIF(o.consumo_standard_kwh, 0)) * 100,
                1
            ) AS risparmio_pct,
            avg_m.media_consumo_macchina,
            avg_m.media_tempo_macchina,
            ROUND(
                (1.0 - o.consumo_kwh / NULLIF(avg_m.media_consumo_macchina, 0)) * 100,
                1
            ) AS delta_vs_media_macchina
        FROM ordini_produzione o
        LEFT JOIN (
            SELECT
                macchina,
                ROUND(AVG(consumo_kwh), 1)           AS media_consumo_macchina,
                ROUND(AVG(tempo_produzione_min), 0)  AS media_tempo_macchina
            FROM ordini_produzione
            GROUP BY macchina
        ) avg_m ON avg_m.macchina = o.macchina
        WHERE o.id = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$id]);
    $ordine = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ordine) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ordine non trovato']);
        exit;
    }

    echo json_encode([
        'ok'     => true,
        'ordine' => $ordine,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Errore query: ' . $e->getMessage()]);
}
