<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "cart" => []]);
    exit;
}

$sql = "SELECT c.*, p.nom, p.prix, p.image, p.description 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$_SESSION['user_id']]);
$cart = $stmt->fetchAll();

$total = 0;
foreach ($cart as $item) {
    $total += $item['prix'] * $item['quantity'];
}

echo json_encode([
    "success" => true,
    "cart" => $cart,
    "total" => $total,
    "count" => count($cart)
]);
?>