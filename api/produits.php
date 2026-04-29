<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Vous devez être connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nom']) || !isset($data['prix']) || !isset($data['description'])) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont requis"]);
    exit;
}

$nom = htmlspecialchars(trim($data['nom']));
$prix = floatval($data['prix']);
$description = htmlspecialchars(trim($data['description']));
$category = isset($data['category']) ? htmlspecialchars(trim($data['category'])) : 'Autre';
$image = isset($data['image']) ? htmlspecialchars(trim($data['image'])) : 'https://via.placeholder.com/300x200?text=Produit';

$sql = "INSERT INTO products (nom, prix, description, category, image, user_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([$nom, $prix, $description, $category, $image, $_SESSION['user_id']]);
    echo json_encode(["success" => true, "message" => "Produit ajouté avec succès !"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
}
?>