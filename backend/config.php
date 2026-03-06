<?php
define('TURSO_DB_URL',      'https://metafan-maarcotoselli.aws-eu-west-1.turso.io');
define('TURSO_AUTH_TOKEN',  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3OTUyOTYsImlkIjoiMDE5Y2MyOGUtZDMwMS03YzYxLTg4YjUtMzFiMWY3N2ZjZmY5IiwicmlkIjoiZjExMDg3YzItMGYyOC00MzNmLTkyZTUtZjZkNTUyMTc0ODE0In0.hBgc2nqYNvNptQ7761MM-PfU19jmczo7UX7p-UlQUqUifQbafThs9oWILQIW3BWffD8ghK3k8qAkO0Pzd9m4BQ');

// Stub PDO constants so existing code that references PDO::FETCH_* still works
if (!class_exists('PDO')) {
    class PDO {
        const FETCH_ASSOC  = 2;
        const FETCH_NUM    = 3;
        const FETCH_COLUMN = 7;
        const ATTR_ERRMODE        = 3;
        const ERRMODE_EXCEPTION   = 2;
    }
}
if (!class_exists('PDOException')) {
    class PDOException extends RuntimeException {}
}

// Allow only safe characters in table/column names supplied by users
function sanitizeTableName(string $name): string {
    return preg_replace('/[^a-zA-Z0-9_]/', '', $name);
}

// ---------------------------------------------------------------------------
// TursoStatement – mimics the PDOStatement interface used in this project
// ---------------------------------------------------------------------------
class TursoStatement {
    private array   $rows;
    private array   $cols;
    private int     $position = 0;
    public  int     $rowsAffected;
    public  ?string $insertId;

    public function __construct(?array $result = null) {
        $this->rows         = $result['rows']               ?? [];
        $this->cols         = array_column($result['cols'] ?? [], 'name');
        $this->rowsAffected = (int)($result['affected_row_count'] ?? 0);
        $this->insertId     = $result['last_insert_rowid']  ?? null;
    }

    private function cell(mixed $raw): mixed {
        if (!is_array($raw)) return $raw;
        return ($raw['type'] === 'null') ? null : ($raw['value'] ?? null);
    }

    private function assocRow(array $raw): array {
        $out = [];
        foreach ($this->cols as $i => $name) {
            $out[$name] = $this->cell($raw[$i]);
        }
        return $out;
    }

    private function numRow(array $raw): array {
        return array_map([$this, 'cell'], array_values($raw));
    }

    public function fetch(int $mode = 2): mixed {
        if ($this->position >= count($this->rows)) return false;
        $raw = $this->rows[$this->position++];
        if ($mode === 7) return $this->cell($raw[0]);   // FETCH_COLUMN
        if ($mode === 3) return $this->numRow($raw);    // FETCH_NUM
        return $this->assocRow($raw);                   // FETCH_ASSOC (default)
    }

    public function fetchAll(int $mode = 2): array {
        $out = [];
        foreach ($this->rows as $raw) {
            if ($mode === 7) { $out[] = $this->cell($raw[0]); continue; }
            if ($mode === 3) { $out[] = $this->numRow($raw);  continue; }
            $out[] = $this->assocRow($raw);
        }
        return $out;
    }

    public function rowCount(): int {
        return count($this->rows) ?: $this->rowsAffected;
    }
}

// ---------------------------------------------------------------------------
// TursoPreparedStatement – handles parameterised queries (INSERT / UPDATE / DELETE)
// ---------------------------------------------------------------------------
class TursoPreparedStatement {
    public function __construct(
        private TursoConnection $conn,
        private string          $sql
    ) {}

    public function execute(array $args = []): TursoStatement {
        return $this->conn->exec($this->sql, $args);
    }
}

// ---------------------------------------------------------------------------
// TursoConnection – sends SQL to the Turso HTTP pipeline endpoint
// ---------------------------------------------------------------------------
class TursoConnection {
    private ?string $lastId = null;

    public function __construct(
        private string $url,
        private string $token
    ) {}

    private function mapArg(mixed $v): array {
        if (is_null($v))  return ['type' => 'null'];
        if (is_int($v))   return ['type' => 'integer', 'value' => (string)$v];
        if (is_float($v)) return ['type' => 'float',   'value' => (string)$v];
        return ['type' => 'text', 'value' => (string)$v];
    }

    public function exec(string $sql, array $args = []): TursoStatement {
        $stmt = ['sql' => $sql];
        if (!empty($args)) {
            $stmt['args'] = array_map([$this, 'mapArg'], array_values($args));
        }

        $payload = json_encode([
            'requests' => [
                ['type' => 'execute', 'stmt' => $stmt],
                ['type' => 'close'],
            ],
        ]);

        $ch = curl_init(rtrim($this->url, '/') . '/v2/pipeline');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $this->token,
                'Content-Type: application/json',
            ],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $body    = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            throw new PDOException("Turso cURL error: $curlErr");
        }
        if ($httpCode >= 400) {
            throw new PDOException("Turso HTTP $httpCode: $body");
        }

        $data  = json_decode($body, true);
        $first = $data['results'][0] ?? null;
        if (($first['type'] ?? '') === 'error') {
            throw new PDOException('Turso query error: ' . ($first['error']['message'] ?? 'Unknown'));
        }

        $result = $first['response']['result'] ?? null;
        $this->lastId = $result['last_insert_rowid'] ?? null;
        return new TursoStatement($result);
    }

    public function query(string $sql): TursoStatement {
        return $this->exec($sql);
    }

    public function prepare(string $sql): TursoPreparedStatement {
        return new TursoPreparedStatement($this, $sql);
    }

    public function lastInsertId(): ?string {
        return $this->lastId;
    }

    // No-op stubs kept for drop-in compatibility
    public function setAttribute(int $attr, mixed $value): void {}
}

try {
    $conn = new TursoConnection(TURSO_DB_URL, TURSO_AUTH_TOKEN);
} catch (Exception $e) {
    die("Errore di connessione al database: " . $e->getMessage());
}
?>