-- =====================================================
-- Script SQL pour créer la base de données ShopNow
-- À exécuter dans MySQL CMD
-- =====================================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS ecommerce_bd 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE ecommerce_bd;

-- =====================================================
-- Table: users (Utilisateurs)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: products (Produits)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Autre',
    image VARCHAR(500),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: cart (Panier)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: orders (Commandes)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('en_attente', 'confirme', 'livre', 'annule') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: order_details (Détails des commandes)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Données de test
-- =====================================================

-- Admin par défaut (password: admin123)
INSERT IGNORE INTO users (nom, email, password, role) VALUES 
('Admin', 'admin@shopnow.tn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Produits de démonstration
INSERT IGNORE INTO products (nom, prix, description, category, image, user_id) VALUES
('iPhone 15 Pro', 4999.99, 'Le smartphone le plus puissant d\'Apple avec puce A17 Pro', 'Électronique', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=300&h=200&fit=crop', 1),
('MacBook Air M3', 6999.99, 'Ordinateur portable ultraléger avec puce M3', 'Électronique', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=300&h=200&fit=crop', 1),
('Nike Air Max', 349.99, 'Baskets confortables avec technologie Air', 'Mode', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop', 1),
('Casque Sony WH-1000XM5', 1299.99, 'Casque sans fil à réduction de bruit premium', 'Électronique', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=200&fit=crop', 1),
('Tapis de Yoga', 89.99, 'Tapis antidérapant pour yoga et pilates', 'Sport', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop', 1),
('Lampe Design', 159.99, 'Lampe de table moderne avec LED réglable', 'Maison', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=200&fit=crop', 1);

-- Vérification
SELECT 'Base de données créée avec succès !' AS status;
SELECT CONCAT('Nombre d\'utilisateurs: ', COUNT(*)) AS users_count FROM users;
SELECT CONCAT('Nombre de produits: ', COUNT(*)) AS products_count FROM products;