<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit;
}

$order_id = intval($_GET['id']);

$sql = "SELECT od.*, p.nom, p.image 
        FROM order_details od 
        JOIN products p ON od.product_id = p.id 
        WHERE od.order_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$order_id]);
$details = $stmt->fetchAll();

echo json_encode(["success" => true, "details" => $details]);
?>