<?php
require 'config.php';

// Vérifier si connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non connecté", "orders" => []]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true, 
        "orders" => $orders
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>