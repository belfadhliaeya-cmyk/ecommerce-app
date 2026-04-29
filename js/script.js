// ===== VARIABLES GLOBALES =====
let currentUser = null;
let allProducts = [];
let currentFilter = 'all';

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
    updateCartCount();
    
    if (document.getElementById('cart-items')) loadCart();
    if (document.getElementById('orders-list')) loadOrders();
    
    // Fermer modal en cliquant à l'extérieur
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') closeAuthModal();
    });
});

// ===== AUTHENTIFICATION =====
function checkAuth() {
    const savedUser = localStorage.getItem('shopnow_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(currentUser);
    }
    updateCartCount();
}

function updateAuthUI(user) {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;
    
    if (user) {
        authLink.innerHTML = `<i class="fas fa-user-check"></i> <span id="auth-text">${user.nom}</span>`;
        authLink.onclick = logout;
    } else {
        authLink.innerHTML = `<i class="fas fa-user"></i> <span id="auth-text">Connexion</span>`;
        authLink.onclick = toggleAuthModal;
    }
}

function toggleAuthModal() {
    document.getElementById('auth-modal').classList.toggle('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('shopnow_user', JSON.stringify(data.user));
            updateAuthUI(data.user);
            closeAuthModal();
            showToast('Connexion réussie ! ✨');
            updateCartCount();
            setTimeout(() => location.reload(), 800);
        } else {
            showToast(data.message, 'error');
        }
    });
}

function register() {
    const nom = document.getElementById('reg-nom').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (!nom || !email || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    fetch('api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Compte créé ! Connectez-vous maintenant. 🎉');
            document.getElementById('reg-nom').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
            document.querySelectorAll('.auth-tab')[0].click();
        } else {
            showToast(data.message, 'error');
        }
    });
}

function logout() {
    fetch('api/logout.php')
        .then(() => {
            currentUser = null;
            localStorage.removeItem('shopnow_user');
            updateAuthUI(null);
            showToast('Déconnexion réussie 👋');
            setTimeout(() => location.reload(), 800);
        })
        .catch(() => {
            localStorage.removeItem('shopnow_user');
            location.reload();
        });
}

// ===== MENU MOBILE =====
function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// ===== PRODUITS =====
function addProduct() {
    const nom = document.getElementById('nom').value.trim();
    const prix = document.getElementById('prix').value;
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const image = document.getElementById('image').value.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop';
    
    if (!nom || !prix || !description) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (parseFloat(prix) <= 0) {
        showToast('Le prix doit être supérieur à 0', 'error');
        return;
    }
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout...';
    btn.disabled = true;
    
    fetch('api/produits.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prix: parseFloat(prix), description, category, image })
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (data.success) {
            showToast(data.message);
            document.getElementById('nom').value = '';
            document.getElementById('prix').value = '';
            document.getElementById('description').value = '';
            document.getElementById('image').value = '';
            scrollToProducts();
            loadProducts();
        } else {
            showToast(data.message, 'error');
            if (data.message.includes('connecté')) toggleAuthModal();
        }
    });
}

function loadProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading" style="grid-column: 1/-1;">
            <div class="spinner"></div>
            <p>Chargement des produits...</p>
        </div>
    `;
    
    fetch('api/get_products.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allProducts = data.products;
                renderProducts(allProducts);
            }
        })
        .catch(() => {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <i class="fas fa-wifi" style="color: var(--danger); font-size: 3rem;"></i>
                    <h3>Erreur de connexion</h3>
                    <button class="btn-primary" onclick="loadProducts()">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        });
}

function renderProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="grid-column: 1/-1;">
                <i class="fas fa-box-open"></i>
                <h3>Aucun produit trouvé</h3>
                <p>Soyez le premier à ajouter un produit !</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map((p, index) => `
        <div class="product-card" style="animation: slideIn 0.5s ease ${index * 0.1}s both;">
            <div class="product-image-wrapper">
                <img src="${p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop'}" 
                     alt="${p.nom}" class="product-image"
                     onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop'">
                <span class="product-badge">${p.category || 'Nouveau'}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${p.category || 'Autre'}</span>
                <h3 class="product-name">${p.nom}</h3>
                <p class="product-description">${p.description || 'Aucune description'}</p>
                <div class="product-footer">
                    <span class="product-price">${parseFloat(p.prix).toFixed(2)} <span>DT</span></span>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id})" title="Ajouter au panier">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === (category === 'all' ? 'Tous' : category)) {
            btn.classList.add('active');
        }
    });
    
    renderProducts(category === 'all' ? allProducts : allProducts.filter(p => p.category === category));
}

function scrollToProducts() {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ===== PANIER =====
function addToCart(productId) {
    const btn = event.target.closest('.add-to-cart-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
    }
    
    fetch('api/add_to_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
    .then(res => res.json())
    .then(data => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i>';
                btn.disabled = false;
            }, 1500);
        }
        
        if (data.success) {
            showToast('Produit ajouté au panier ! 🛒');
            updateCartCount();
        } else {
            showToast(data.message, 'error');
            if (data.message.includes('connecté')) setTimeout(toggleAuthModal, 500);
        }
    });
}

function updateCartCount() {
    fetch('api/get_cart.php')
        .then(res => res.json())
        .then(data => {
            const count = data.count || 0;
            document.querySelectorAll('#cart-count').forEach(badge => {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
            });
        })
        .catch(() => {
            document.querySelectorAll('#cart-count').forEach(badge => badge.style.display = 'none');
        });
}

function loadCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Chargement du panier...</p>
        </div>
    `;
    
    fetch('api/get_cart.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.cart?.length) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-basket"></i>
                        <h3>Votre panier est vide</h3>
                        <p>Ajoutez des produits pour commencer vos achats</p>
                        <button class="btn-primary" onclick="window.location.href='index.html'">
                            <i class="fas fa-arrow-left"></i> Continuer les achats
                        </button>
                    </div>
                `;
                updateCartSummary(0);
                return;
            }
            
            container.innerHTML = data.cart.map((item, index) => `
                <div class="cart-item" style="animation: slideIn 0.4s ease ${index * 0.1}s both;">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'}" 
                         alt="${item.nom}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'">
                    <div class="cart-item-info">
                        <h4>${item.nom}</h4>
                        <p style="color: var(--gray); font-size: 0.85rem;">
                            ${parseFloat(item.prix).toFixed(2)} DT x ${item.quantity}
                        </p>
                    </div>
                    <div class="cart-item-price">${(item.prix * item.quantity).toFixed(2)} DT</div>
                    <button class="btn-danger btn-sm" onclick="removeFromCart(${item.id})" title="Retirer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
            
            updateCartSummary(data.total);
        })
        .catch(() => {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                    <h3>Erreur de chargement</h3>
                    <button class="btn-primary" onclick="loadCart()">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        });
}

function updateCartSummary(total) {
    const subtotal = document.getElementById('subtotal');
    const cartTotal = document.getElementById('cart-total');
    if (subtotal) subtotal.textContent = parseFloat(total).toFixed(2) + ' DT';
    if (cartTotal) cartTotal.textContent = parseFloat(total).toFixed(2) + ' DT';
}

function removeFromCart(cartId) {
    const item = event.target.closest('.cart-item');
    if (item) item.style.animation = 'slideOut 0.3s ease forwards';
    
    fetch('api/remove_from_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Produit retiré du panier');
            setTimeout(() => { loadCart(); updateCartCount(); }, 300);
        } else {
            showToast(data.message, 'error');
            if (item) item.style.animation = '';
        }
    });
}

function validerCommande() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
    btn.disabled = true;
    
    fetch('api/valider_commande.php', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (data.success) {
            showToast(`Commande #${data.order_id} validée ! 🎉`);
            createConfetti();
            updateCartCount();
            setTimeout(() => window.location.href = 'orders.html', 2000);
        } else {
            showToast(data.message, 'error');
            if (data.message.includes('connecté')) toggleAuthModal();
        }
    });
}

// ===== COMMANDES =====
function loadOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Chargement des commandes...</p>
        </div>
    `;
    
    fetch('api/get_orders.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.orders?.length) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-box-open"></i>
                        <h3>Aucune commande</h3>
                        <p>Vous n'avez pas encore passé de commande</p>
                        <button class="btn-primary" onclick="window.location.href='index.html'">
                            <i class="fas fa-shopping-bag"></i> Découvrir les produits
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.orders.map((order, index) => `
                <div class="order-card" style="animation: slideIn 0.4s ease ${index * 0.1}s both;">
                    <div class="order-header">
                        <div>
                            <span class="order-id">Commande #${order.id}</span>
                            <p style="color: var(--gray); font-size: 0.85rem; margin-top: 0.3rem;">
                                <i class="fas fa-calendar-alt"></i> ${formatDate(order.created_at)}
                            </p>
                        </div>
                        <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span>
                    </div>
                    <div class="order-details">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-box" style="color: var(--primary);"></i>
                            <span style="color: var(--gray);">Commande enregistrée</span>
                        </div>
                        <span class="order-total">${parseFloat(order.total).toFixed(2)} DT</span>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                    <h3>Erreur de chargement</h3>
                    <button class="btn-primary" onclick="loadOrders()">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        });
}

function getStatusLabel(status) {
    const labels = {
        'en_attente': '⏳ En attente',
        'confirme': '✅ Confirmé',
        'livre': '📦 Livré',
        'annule': '❌ Annulé'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// ===== UTILITAIRES =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;
    
    const icon = toast.querySelector('i');
    if (icon) {
        icon.className = type === 'error' ? 'fas fa-times-circle' : 
                        type === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        icon.style.color = type === 'error' ? 'var(--danger)' : 
                           type === 'warning' ? 'var(--warning)' : 'var(--success)';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== CONFETTI =====
function createConfetti() {
    const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px; height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            top: -10px; left: ${Math.random() * 100}vw; z-index: 9999;
            animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

// Ajouter animations CSS dynamiques
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes slideOut {
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);