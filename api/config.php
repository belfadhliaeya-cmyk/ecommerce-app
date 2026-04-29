<?php
// ⭐ SESSION EN PREMIER, AVANT TOUT !
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Headers CORS (après session_start)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "127.0.0.1";
$dbname = "ecommerce_bd";
$username = "root";
$password = "";
$port = 3306; // Change en 3307 si ton MySQL utilise 3307

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur DB: " . $e->getMessage()]);
    exit;
}
?>