<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Email et mot de passe requis"]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$user = $stmt->fetch();

// Vérification en clair (pour admin123)
if ($user && $password === $user['password']) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nom'] = $user['nom'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    
    echo json_encode([
        "success" => true,
        "message" => "Connexion réussie !",
        "user" => [
            "id" => $user['id'],
            "nom" => $user['nom'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]);
} else if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nom'] = $user['nom'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    
    echo json_encode([
        "success" => true,
        "message" => "Connexion réussie !",
        "user" => [
            "id" => $user['id'],
            "nom" => $user['nom'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Email ou mot de passe incorrect"]);
}
?>