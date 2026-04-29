<?php
require 'config.php';

// Test 1: Session
echo "✅ Session active: " . (isset($_SESSION) ? "OUI" : "NON") . "\n";

// Test 2: Connexion DB
try {
    $stmt = $pdo->query("SELECT 1");
    echo "✅ Connexion DB: OK\n";
} catch (Exception $e) {
    echo "❌ Connexion DB: " . $e->getMessage() . "\n";
}

// Test 3: Tables existantes
try {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Tables trouvées: " . implode(", ", $tables) . "\n";
} catch (Exception $e) {
    echo "❌ Erreur tables: " . $e->getMessage() . "\n";
}

// Test 4: Table users
try {
    $users = $pdo->query("SELECT COUNT(*) as total FROM users")->fetch();
    echo "✅ Utilisateurs: " . $users['total'] . "\n";
} catch (Exception $e) {
    echo "❌ Erreur users: " . $e->getMessage() . "\n";
}
?>