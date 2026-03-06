<?php
session_start();

// Redirect to login if not authenticated
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$username = htmlspecialchars($_SESSION['username']);
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — MetaFan Management</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/dashboard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

  <div class="dashboard-wrapper">

    <!-- ═══ SIDEBAR ═══ -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">MF</div>
        <div class="sidebar-title">Meta<span>Fan</span></div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-title">Principale</div>
          <a class="sidebar-link active" data-view="overview">
            <i class="fas fa-th-large"></i> Panoramica
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-title">Gestione Dati</div>
          <a class="sidebar-link" data-view="view">
            <i class="fas fa-eye"></i> Visualizza Dati
          </a>
          <a class="sidebar-link" data-view="add">
            <i class="fas fa-plus-circle"></i> Aggiungi Dati
          </a>
          <a class="sidebar-link" data-view="edit">
            <i class="fas fa-edit"></i> Modifica Dati
          </a>
          <a class="sidebar-link" data-view="delete">
            <i class="fas fa-trash-alt"></i> Elimina Record
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-title">Amministrazione</div>
          <a class="sidebar-link" data-view="drop">
            <i class="fas fa-exclamation-triangle"></i> Elimina Relazione
          </a>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-title">Navigazione</div>
          <a class="sidebar-link" href="index.html">
            <i class="fas fa-globe"></i> Vai al Sito
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar"><?= strtoupper(substr($username, 0, 2)) ?></div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name"><?= $username ?></div>
            <div class="sidebar-user-role">Amministratore</div>
          </div>
          <a href="logout.php" title="Logout" style="color:var(--text-muted);transition:color .15s ease;">
            <i class="fas fa-sign-out-alt"></i>
          </a>
        </div>
      </div>
    </aside>

    <!-- Sidebar overlay for mobile -->
    <div class="sidebar-overlay"></div>

    <!-- ═══ MAIN CONTENT ═══ -->
    <main class="dashboard-main">

      <!-- Topbar -->
      <div class="dashboard-topbar">
        <div class="topbar-left">
          <button class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
          </button>
          <div>
            <div class="topbar-title" id="topbarTitle">Panoramica</div>
            <div class="topbar-breadcrumb">Dashboard <span>/ Panoramica</span></div>
          </div>
        </div>
        <div class="topbar-right">
          <a href="logout.php" class="btn btn-ghost" style="color:var(--text-muted);">
            <i class="fas fa-sign-out-alt"></i> Esci
          </a>
        </div>
      </div>

      <!-- Dynamic Content Area -->
      <div class="dashboard-content" id="dashboardContent">
        <div class="loading-overlay"><div class="spinner"></div></div>
      </div>

    </main>
  </div>

  <!-- ═══ TOAST CONTAINER ═══ -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- ═══ CONFIRM MODAL ═══ -->
  <div class="modal-overlay" id="confirmModal">
    <div class="modal">
      <div class="modal-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Conferma Eliminazione</h3>
      <p>Sei sicuro di voler procedere? Questa azione non può essere annullata.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modalCancelBtn">Annulla</button>
        <button class="btn btn-danger" id="modalConfirmBtn"><i class="fas fa-trash"></i> Elimina</button>
      </div>
    </div>
  </div>

  <script src="js/dashboard.js"></script>
</body>
</html>
