<?php
require 'config.php';

session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Vous devez être connecté pour ajouter un produit"]);
    exit;
}

// Récupérer les données JSON
$data = json_decode(file_get_contents("php://input"), true);

// Valider les champs obligatoires
if (!isset($data['nom']) || !isset($data['prix']) || !isset($data['description'])) {
    echo json_encode(["success" => false, "message" => "Les champs nom, prix et description sont obligatoires"]);
    exit;
}

// Nettoyer les entrées
$nom = htmlspecialchars(trim($data['nom']));
$prix = floatval($data['prix']);
$description = htmlspecialchars(trim($data['description']));
$category = isset($data['category']) ? htmlspecialchars(trim($data['category'])) : 'Autre';
$image = isset($data['image']) ? htmlspecialchars(trim($data['image'])) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop';

// Valider le prix
if ($prix <= 0) {
    echo json_encode(["success" => false, "message" => "Le prix doit être supérieur à 0"]);
    exit;
}

// Valider la longueur du nom
if (strlen($nom) < 2) {
    echo json_encode(["success" => false, "message" => "Le nom doit contenir au moins 2 caractères"]);
    exit;
}

// Insérer le produit
$sql = "INSERT INTO products (nom, prix, description, category, image, user_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([$nom, $prix, $description, $category, $image, $_SESSION['user_id']]);
    echo json_encode([
        "success" => true, 
        "message" => "Produit \"" . $nom . "\" ajouté avec succès !",
        "product_id" => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erreur lors de l'ajout: " . $e->getMessage()]);
}
?>