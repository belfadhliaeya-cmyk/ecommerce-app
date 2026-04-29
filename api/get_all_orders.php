<?php
require 'config.php';

// Vérifier si admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Accès réservé aux administrateurs"]);
    exit;
}

try {
    $sql = "SELECT o.*, u.nom as client_nom, u.email as client_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC";
    $stmt = $pdo->query($sql);
    $orders = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "orders" => $orders]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>