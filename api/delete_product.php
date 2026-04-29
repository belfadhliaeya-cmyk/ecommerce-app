<?php
require 'config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Accès refusé"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data['id']);

$sql = "DELETE FROM products WHERE id = ?";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Produit supprimé"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>