<?php
require 'config.php';

try {
    $sql = "SELECT p.*, u.nom as vendeur_nom 
            FROM products p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC";
    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "products" => $products]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>