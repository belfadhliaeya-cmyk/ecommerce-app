<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Veuillez vous connecter"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$product_id = intval($data['product_id']);
$quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;

// Vérifier si le produit existe
$check = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$check->execute([$product_id]);
$product = $check->fetch();

if (!$product) {
    echo json_encode(["success" => false, "message" => "Produit non trouvé"]);
    exit;
}

// Vérifier si déjà dans le panier
$cartCheck = $pdo->prepare("SELECT * FROM cart WHERE user_id = ? AND product_id = ?");
$cartCheck->execute([$_SESSION['user_id'], $product_id]);
$existing = $cartCheck->fetch();

if ($existing) {
    $newQty = $existing['quantity'] + $quantity;
    $update = $pdo->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
    $update->execute([$newQty, $existing['id']]);
} else {
    $insert = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
    $insert->execute([$_SESSION['user_id'], $product_id, $quantity]);
}

echo json_encode(["success" => true, "message" => "Ajouté au panier !"]);
?>