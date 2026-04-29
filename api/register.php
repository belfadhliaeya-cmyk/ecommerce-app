<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nom']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont requis"]);
    exit;
}

$nom = htmlspecialchars(trim($data['nom']));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

// Vérifier si l'email existe déjà
$check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    echo json_encode(["success" => false, "message" => "Cet email est déjà utilisé"]);
    exit;
}

$sql = "INSERT INTO users (nom, email, password, role, created_at) VALUES (?, ?, ?, 'user', NOW())";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([$nom, $email, $password]);
    echo json_encode(["success" => true, "message" => "Compte créé avec succès !"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
}
?>