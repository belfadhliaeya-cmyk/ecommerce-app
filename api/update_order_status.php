<?php
require 'config.php';

// Vérifier si admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Accès réservé aux administrateurs"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Données manquantes"]);
    exit;
}

$order_id = intval($data['order_id']);
$status = $data['status'];

$valid_statuses = ['en_attente', 'confirme', 'livre', 'annule'];
if (!in_array($status, $valid_statuses)) {
    echo json_encode(["success" => false, "message" => "Statut invalide"]);
    exit;
}

try {
    $sql = "UPDATE orders SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $order_id]);
    
    echo json_encode([
        "success" => true, 
        "message" => "Statut de la commande #$order_id mis à jour: " . $status
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>