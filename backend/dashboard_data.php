<?php
/**
 * dashboard_data.php — Endpoint PHP per dati aggregati dashboard ordini
 * Recupera consumi, tempi e qualità aggregati per macchina.
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

try {
    // Query ottimizzata: aggregazione per macchina con una sola scansione
    $sql = "
        SELECT
            macchina,
            COUNT(*)                              AS ordini,
            ROUND(SUM(ore_lavorate), 1)          AS ore_totali,
            ROUND(AVG(ore_lavorate), 1)          AS ore_medie,
            ROUND(SUM(consumo_kwh), 1)           AS consumo_totale,
            ROUND(SUM(consumo_standard_kwh), 1)  AS consumo_std_totale,
            ROUND(AVG(tempo_produzione_min), 0)  AS tempo_medio_min,
            ROUND(
                (1.0 - SUM(consumo_kwh) / NULLIF(SUM(consumo_standard_kwh), 0)) * 100,
                1
            ) AS risparmio_pct,
            ROUND(
                SUM(CASE WHEN esito = 'Superato' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                0
            ) AS tasso_superamento
        FROM ordini_produzione
        GROUP BY macchina
        ORDER BY macchina ASC, ore_totali DESC, tempo_medio_min ASC
    ";

    $stmt = $conn->query($sql);
    $perMacchina = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Query ottimizzata: totali globali in una sola passata
    $sqlTotali = "
        SELECT
            COUNT(*)                                       AS totale_ordini,
            ROUND(SUM(ore_lavorate), 1)                    AS ore_totali,
            ROUND(SUM(consumo_kwh), 1)                     AS consumo_totale,
            ROUND(SUM(consumo_standard_kwh), 1)            AS consumo_std_totale,
            ROUND(AVG(tempo_produzione_min), 0)            AS tempo_medio,
            ROUND(
                (1.0 - SUM(consumo_kwh) / NULLIF(SUM(consumo_standard_kwh), 0)) * 100,
                1
            ) AS risparmio_globale,
            ROUND(
                SUM(CASE WHEN esito = 'Superato' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                0
            ) AS tasso_superamento_globale
        FROM ordini_produzione
    ";

    $stmtTotali = $conn->query($sqlTotali);
    $totali = $stmtTotali->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok'           => true,
        'totali'       => $totali,
        'per_macchina' => $perMacchina,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Errore query: ' . $e->getMessage()]);
}
