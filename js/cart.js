// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.querySelector('.cart-count');
const emptyCartMessage = document.querySelector('.empty-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const subtotalElement = document.querySelector('.subtotal');
const totalElement = document.querySelector('.total');
const checkoutBtn = document.querySelector('.checkout-btn');
const continueShoppingBtn = document.querySelector('.continue-shopping');

// Initialize cart
function initCart() {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Add item to cart
function addToCart(name, price, image, size = 'One Size', quantity = 1) {
    const existingItem = cart.find(item => 
        item.name === name && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name,
            price,
            image,
            size,
            quantity,
        });
        console.log(cart)
    }
    
    updateCart();
    showAddedToCartMessage(name);
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

function updateCartCount() {
    if (!cartCount) return;
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    console.log(totalItems)
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function showAddedToCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'cart-notification';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${productName} foi adicionado ao carrinho</span>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('fade-out');
        setTimeout(() => message.remove(), 300);
    }, 2000);
}

// Render cart items
function renderCart() {
    if (!cartItemsContainer || !emptyCartMessage) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        if (subtotalElement) subtotalElement.textContent = 'R$0.00';
        if (totalElement) totalElement.textContent = 'R$0.00';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="../${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">R$${item.price.toFixed(2)}</div>
                <div class="cart-item-size">Tamanho: ${item.size}</div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn plus" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    if (subtotalElement) subtotalElement.textContent = `R$${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `R$${subtotal.toFixed(2)}`;
    
    // Add event listeners to dynamic elements
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            if (e.currentTarget.classList.contains('plus')) {
                cart[index].quantity += 1;
            } else {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
            }
            updateCart();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
        });
    });
}


// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', initCart);