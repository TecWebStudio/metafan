<?php
/**
 * MetaFan API — JSON wrapper for database operations
 * This file communicates with the backend config and provides
 * a clean JSON API for the frontend dashboard.
 */

header('Content-Type: application/json; charset=utf-8');
session_start();

// Include backend database config
require_once __DIR__ . '/../backend/config.php';

// Get the action parameter
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Auth check for protected actions
$protectedActions = ['tables', 'columns', 'data', 'insert', 'update', 'delete', 'drop', 'foreign_keys', 'stats'];
if (in_array($action, $protectedActions) && !isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autenticato']);
    exit;
}

switch ($action) {

    // ─── LOGIN ───
    case 'login':
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if ($username === 'metafan' && $password === 'metapassword') {
            $_SESSION['username'] = $username;
            echo json_encode(['success' => true, 'username' => $username]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Nome utente o password errati']);
        }
        break;

    // ─── LOGOUT ───
    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    // ─── CHECK AUTH ───
    case 'check_auth':
        echo json_encode([
            'success' => true,
            'authenticated' => isset($_SESSION['username']),
            'username' => $_SESSION['username'] ?? null
        ]);
        break;

    // ─── LIST TABLES ───
    case 'tables':
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['success' => true, 'tables' => $tables]);
        break;

    // ─── COLUMNS OF A TABLE ───
    case 'columns':
        $table = $_GET['table'] ?? '';
        if (!$table) {
            echo json_encode(['success' => false, 'error' => 'Tabella non specificata']);
            break;
        }
        $stmt = $conn->query("DESCRIBE `$table`");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'columns' => $columns]);
        break;

    // ─── TABLE DATA ───
    case 'data':
        $table = $_GET['table'] ?? '';
        if (!$table) {
            echo json_encode(['success' => false, 'error' => 'Tabella non specificata']);
            break;
        }

        // Get columns
        $stmt_col = $conn->query("DESCRIBE `$table`");
        $columns = $stmt_col->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');

        // Get primary keys
        $stmt_pk = $conn->query("SHOW KEYS FROM `$table` WHERE Key_name='PRIMARY'");
        $pkRows = $stmt_pk->fetchAll(PDO::FETCH_ASSOC);
        $primaryKeys = array_column($pkRows, 'Column_name');

        // Get data
        $stmt_data = $conn->query("SELECT * FROM `$table`");
        $rows = $stmt_data->fetchAll(PDO::FETCH_ASSOC);

        // Get row count
        $rowCount = count($rows);

        echo json_encode([
            'success' => true,
            'columns' => $columnNames,
            'primaryKeys' => $primaryKeys,
            'rows' => $rows,
            'rowCount' => $rowCount
        ]);
        break;

    // ─── FOREIGN KEYS ───
    case 'foreign_keys':
        $table = $_GET['table'] ?? '';
        $stmt_fk = $conn->query("
            SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        $fks = [];
        foreach ($stmt_fk->fetchAll(PDO::FETCH_ASSOC) as $fk) {
            $fks[$fk['TABLE_NAME']][$fk['COLUMN_NAME']] = [
                'referenced_table' => $fk['REFERENCED_TABLE_NAME'],
                'referenced_column' => $fk['REFERENCED_COLUMN_NAME']
            ];
        }

        // If a specific table is requested, also get the reference data
        if ($table && isset($fks[$table])) {
            foreach ($fks[$table] as $col => &$info) {
                $refTable = $info['referenced_table'];
                $refCol = $info['referenced_column'];
                $stmt_ref = $conn->query("SELECT * FROM `$refTable`");
                $refRows = $stmt_ref->fetchAll(PDO::FETCH_ASSOC);
                $options = [];
                foreach ($refRows as $r) {
                    $val = $r[$refCol];
                    $label = $r['Nome'] ?? $r['Ragione_Sociale'] ?? $val;
                    $options[] = ['value' => $val, 'label' => "$val - $label"];
                }
                $info['options'] = $options;
            }
            echo json_encode(['success' => true, 'foreign_keys' => $fks[$table] ?? []]);
        } else {
            echo json_encode(['success' => true, 'foreign_keys' => $fks]);
        }
        break;

    // ─── INSERT ───
    case 'insert':
        $table = $_POST['table'] ?? '';
        $data = $_POST['data'] ?? [];

        if (!$table || empty($data)) {
            echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
            break;
        }

        $fields = [];
        $values = [];
        foreach ($data as $col => $val) {
            if ($val !== '') {
                $fields[] = "`$col`";
                $values[] = $val;
            }
        }

        if (count($fields) > 0) {
            $placeholders = rtrim(str_repeat('?,', count($values)), ',');
            $sql = "INSERT INTO `$table` (" . implode(',', $fields) . ") VALUES ($placeholders)";
            $stmt = $conn->prepare($sql);
            try {
                $stmt->execute($values);
                echo json_encode(['success' => true, 'message' => 'Record inserito correttamente']);
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Nessun campo compilato']);
        }
        break;

    // ─── UPDATE ───
    case 'update':
        $table = $_POST['table'] ?? '';
        $pkData = $_POST['pk'] ?? []; // associative array of primary key values
        $data = $_POST['data'] ?? [];

        if (!$table || empty($pkData) || empty($data)) {
            echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
            break;
        }

        $updates = [];
        $values = [];
        foreach ($data as $col => $val) {
            $updates[] = "`$col` = ?";
            $values[] = $val;
        }

        $where = [];
        foreach ($pkData as $col => $val) {
            $where[] = "`$col` = ?";
            $values[] = $val;
        }

        $sql = "UPDATE `$table` SET " . implode(',', $updates) . " WHERE " . implode(' AND ', $where);
        $stmt = $conn->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(['success' => true, 'message' => 'Record aggiornato correttamente']);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // ─── DELETE RECORD ───
    case 'delete':
        $table = $_POST['table'] ?? '';
        $pkData = $_POST['pk'] ?? [];

        if (!$table || empty($pkData)) {
            echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
            break;
        }

        $where = [];
        $values = [];
        foreach ($pkData as $col => $val) {
            $where[] = "`$col` = ?";
            $values[] = $val;
        }

        $sql = "DELETE FROM `$table` WHERE " . implode(' AND ', $where);
        $stmt = $conn->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(['success' => true, 'message' => 'Record eliminato correttamente']);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // ─── DROP TABLE ───
    case 'drop':
        $table = $_POST['table'] ?? '';

        if (!$table) {
            echo json_encode(['success' => false, 'error' => 'Tabella non specificata']);
            break;
        }

        try {
            $conn->exec("DROP TABLE `$table`");
            echo json_encode(['success' => true, 'message' => "Tabella '$table' eliminata correttamente"]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // ─── STATS (for dashboard overview) ───
    case 'stats':
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $totalTables = count($tables);
        $totalRows = 0;

        foreach ($tables as $t) {
            $res = $conn->query("SELECT COUNT(*) FROM `$t`");
            $totalRows += $res->fetchColumn();
        }

        echo json_encode([
            'success' => true,
            'stats' => [
                'tables' => $totalTables,
                'rows' => $totalRows,
                'database' => 'metafan'
            ]
        ]);
        break;

    // ─── DEFAULT ───
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Azione non valida']);
        break;
}
