<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$cart_id = intval($data['cart_id']);

$sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$cart_id, $_SESSION['user_id']]);

echo json_encode(["success" => true, "message" => "Retiré du panier"]);
?>