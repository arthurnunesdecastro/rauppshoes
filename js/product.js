document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("shoe");
    const productContainer = document.querySelector('.product-container');

    function animateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.classList.add('animate');
            cartCount.addEventListener('animationend', () => {
                cartCount.classList.remove('animate');
            }, { once: true });
        }
    }

    function animateCartNotification(name, size) {
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement('div');
        notification.classList.add('cart-notification');
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>"${name}" (${size}) adicionado ao carrinho</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('animationend', () => {
                notification.remove();
            }, { once: true });
        }, 2500);
    }

    function addToCart(name, price, image, size, quantity) {
        const existingItemIndex = cart.findIndex(item =>
            item.name === name &&
            item.size === size &&
            item.image === image
        );

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            const newItem = {
                name,
                price,
                image,
                size,
                quantity
            };
            cart.push(newItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();

        animateCartNotification(name, size);
        animateCartCount();

    }

    fetch('../products.json')
      .then(response => response.json())
      .then(products => {
        const product = products[name];
        if (product) {
            document.title = product.name + ' · Raupp Shoes';
            productContainer.innerHTML = `
                <!-- Product Gallery -->
                <div class="product-gallery">
                    <div class="thumbnail-images">
                        <div class="thumbnail">
                            <img src="../${product.images[0]}" alt="BAGGY WASHED GREEN">
                        </div>
                        <div class="thumbnail">
                            <img src="../${product.images[1]}" alt="BAGGY WASHED GREEN">
                        </div>
                        <div class="thumbnail">
                            <img src="../${product.images[2]}" alt="BAGGY WASHED GREEN">
                        </div>
                    </div>
                    <div class="main-image">
                        <img src="../${product.images[0]}" alt="BAGGY WASHED GREEN">
                    </div>
                </div>

                <!-- Product Details -->
                <div class="product-details">
                    <h1>${product.name}</h1>
                    
                    <div class="product-price">
                        <span class="current-price">R$${String(product.price.toFixed(2)).replace('.',',')}</span>
                        <span class="original-price">R$${String(product.originalPrice.toFixed(2)).replace('.',',')}</span>
                        <span class="discount">${product.discount}</span>
                    </div>
                    
                    <div class="installments">${product.installments}</div>
                    <div class="payment-discount">5% de desconto pagando com PIX</div>
                    
                    
                    <!-- Size Selector -->
                    <div class="size-selector">
                        <h3>Tamanho:</h3>
                        <div class="size-options">
                            <div class="size-option">36</div>
                            <div class="size-option">38</div>
                            <div class="size-option selected">40</div>
                            <div class="size-option">42</div>
                            <div class="size-option">44</div>
                            <div class="size-option unavailable">46</div>
                            <div class="size-option unavailable">48</div>
                        </div>
                    </div>
                    
                    <!-- Quantity Selector -->
                    <div class="quantity-selector">
                        <div class="quantity-control">
                            <button class="quantity-btn minus">-</button>
                            <input type="text" class="quantity-input" value="1" readonly>
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <button class="add-to-cart">Comprar</button>
                    </div>
                    
                    <!-- Product Description -->
                    <div class="product-description">
                        <h2>Descrição do Produto</h2>
                        <p>
                            ${product.description}
                        </p>
                    </div>
                </div>
            `;
            const thumbnails = document.querySelectorAll('.thumbnail img');
            const mainImage = document.querySelector('.main-image img');
            
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.src;
                });
            });
            
            const sizeOptions = document.querySelectorAll('.size-option:not(.unavailable)');
            sizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    sizeOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });

            const minusBtn = document.querySelector('.quantity-btn:first-child');
            const plusBtn = document.querySelector('.quantity-btn:last-child');
            const quantityInput = document.querySelector('.quantity-input');
            
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });
            
            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                quantityInput.value = value + 1;
            });

            const addToCartBtn = document.querySelector('.add-to-cart');
            addToCartBtn.addEventListener('click', () => {
                console.log('A quantidade escolhida é: ', quantityInput.value)
                const size = document.querySelector('.size-option.selected').textContent
                addToCart(
                    product.name,
                    product.price,
                    product.images[0],
                    size ,
                    Number(quantityInput.value)
                );
            });
        } else {
            productContainer.innerHTML = "<p>Produto não encontrado.</p>";
        }
      });
    

    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            

            const paymentDiscount = document.querySelector('.payment-discount');
            if (method.querySelector('.fa-qrcode')) {
                paymentDiscount.textContent = '5% de desconto pagando com PIX';
            } else if (method.querySelector('.fa-barcode')) {
                paymentDiscount.textContent = '3% de desconto pagando com Boleto';
            } else {
                paymentDiscount.textContent = 'Parcele em até 12x sem juros';
            }
        });
    });

});

