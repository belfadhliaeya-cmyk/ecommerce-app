<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Veuillez vous connecter"]);
    exit;
}

// Récupérer le panier
$sql = "SELECT c.*, p.prix FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$_SESSION['user_id']]);
$cart = $stmt->fetchAll();

if (empty($cart)) {
    echo json_encode(["success" => false, "message" => "Panier vide"]);
    exit;
}

$total = 0;
foreach ($cart as $item) {
    $total += $item['prix'] * $item['quantity'];
}

// Créer la commande
$pdo->beginTransaction();

try {
    $orderSql = "INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, 'en_attente', NOW())";
    $orderStmt = $pdo->prepare($orderSql);
    $orderStmt->execute([$_SESSION['user_id'], $total]);
    $order_id = $pdo->lastInsertId();

    // Ajouter les détails
    $detailSql = "INSERT INTO order_details (order_id, product_id, quantity, prix_unitaire) VALUES (?, ?, ?, ?)";
    $detailStmt = $pdo->prepare($detailSql);

    foreach ($cart as $item) {
        $detailStmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['prix']]);
    }

    // Vider le panier
    $clearCart = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
    $clearCart->execute([$_SESSION['user_id']]);

    $pdo->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Commande #" . $order_id . " validée !",
        "order_id" => $order_id,
        "total" => $total
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
}
?>