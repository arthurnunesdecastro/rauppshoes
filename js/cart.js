let cart = JSON.parse(localStorage.getItem('cart')) || [];

let appliedDiscount = 0;
let frete = 0;
let cidadeDestino = "";
let estadoDestino = "";
let pagamentoSelecionado = "PIX";
let descontoPagamento = 5;

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
        initPagamento();
    }

    const calcFreteBtn = document.getElementById("calc-frete");
    if (calcFreteBtn) {
        calcFreteBtn.addEventListener("click", calcularFrete);
    }

    const cepInput = document.getElementById("cep");
    if (cepInput) {
        cepInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 5) {
                value = value.slice(0, 5) + "-" + value.slice(5, 8);
            }
            e.target.value = value;
        });
        cepInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") calcularFrete();
        });
    }

    const aplicarCupomBtn = document.getElementById("aplicar-cupom");
    if (aplicarCupomBtn) {
        aplicarCupomBtn.addEventListener("click", aplicarCupom);
    }
});

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    const totalItems = cart.reduce((tot, item) => tot + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function initPagamento() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');

            const title = method.querySelector('.payment-title').textContent.toUpperCase();
            if (title.includes("PIX")) {
                pagamentoSelecionado = "PIX";
                descontoPagamento = 5;
            } else if (title.includes("BOLETO")) {
                pagamentoSelecionado = "BOLETO";
                descontoPagamento = 3;
            } else {
                pagamentoSelecionado = "CARTÃO";
                descontoPagamento = 0;
            }

            renderCart();
        });
    });
}

function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart');
    const subtotalElem = document.querySelector('.subtotal');
    const freteElem = document.querySelector('.frete');
    const totalElem = document.querySelector('.total');
    const cupomInfoElem = document.getElementById("cupom-info");

    if (!cartItemsContainer || !emptyCartMessage) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        subtotalElem.textContent = 'R$0.00';
        freteElem.textContent = 'R$0.00';
        totalElem.textContent = 'R$0.00';
        cupomInfoElem.textContent = "";
        return;
    }

    emptyCartMessage.style.display = 'none';
    cartItemsContainer.style.display = 'block';

    let subtotal = 0;
    cart.forEach((item, index) => {
        const totalItem = item.price * item.quantity;
        subtotal += totalItem;

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

    const descontoCupom = subtotal * (appliedDiscount / 100);
    const subtotalComCupom = subtotal - descontoCupom;

    const descontoPagamentoValor = subtotalComCupom * (descontoPagamento / 100);

    const totalComFrete = subtotalComCupom - descontoPagamentoValor + frete;

    subtotalElem.textContent = `R$${subtotal.toFixed(2)}`;
    freteElem.textContent = frete === 0 ? "Grátis" : `R$${frete.toFixed(2)}`;
    totalElem.textContent = `R$${totalComFrete.toFixed(2)}`;

    if (appliedDiscount > 0) {
        cupomInfoElem.style.display = "block";
        cupomInfoElem.textContent = `Cupom aplicado: ${appliedDiscount}% OFF (-R$${descontoCupom.toFixed(2)})`;
    } else {
        cupomInfoElem.style.display = "none";
    }

    const descontoRow = document.querySelector(".discount-amount").parentElement;
    const pagamentoRow = document.querySelector(".payment-discount-amount").parentElement;
    const freteRow = document.querySelector(".frete").parentElement;
    const totalRow = document.querySelector(".total").parentElement;

    if (!estadoDestino) {
        descontoRow.style.display = "none";
        pagamentoRow.style.display = "none";
        freteRow.style.display = "none";
        totalRow.style.display = "none";
    } else {
        freteRow.style.display = "flex";
        totalRow.style.display = "flex";

        if (descontoCupom > 0) {
            document.querySelector(".discount-amount").textContent = `-R$${descontoCupom.toFixed(2)}`;
            descontoRow.style.display = "flex";
        } else {
            descontoRow.style.display = "none";
        }

        if (descontoPagamentoValor > 0) {
            document.querySelector(".payment-discount-amount").textContent = `-R$${descontoPagamentoValor.toFixed(2)}`;
            pagamentoRow.style.display = "flex";
        } else {
            pagamentoRow.style.display = "none";
        }
    }

    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (btn.classList.contains('plus')) {
                cart[idx].quantity += 1;
            } else {
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1);
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            cart.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        });
    });
}

async function calcularFrete() {
    const cepField = document.getElementById("cep");
    const freteInfo = document.getElementById("frete-info");
    const freteOpcoesElem = document.getElementById("frete-opcoes");

    const cepRaw = cepField.value.replace(/\D/g, "");

    freteOpcoesElem.style.display = "none";
    freteOpcoesElem.innerHTML = "";

    if (cepRaw.length !== 8) {
        freteInfo.style.color = "red";
        freteInfo.textContent = "Digite um CEP válido (8 números).";
        return;
    }

    try {
        const resp = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
        const data = await resp.json();

        if (data.erro) {
            freteInfo.style.color = "red";
            freteInfo.textContent = "CEP não encontrado.";
            return;
        }

        estadoDestino = data.uf;
        cidadeDestino = data.localidade;

        const opcoes = [];

        if (estadoDestino === "SC") {
            opcoes.push({
                id: "gratis_sc",
                nome: "Frete Grátis (SC)",
                preco: 0,
                prazo: "3 a 5 dias úteis"
            });
        }

        opcoes.push({
            id: "pac",
            nome: "Correios PAC",
            preco: 22.90,
            prazo: "7 a 10 dias úteis"
        });
        opcoes.push({
            id: "sedex",
            nome: "Correios SEDEX",
            preco: 38.90,
            prazo: "2 a 5 dias úteis"
        });
        opcoes.push({
            id: "jadlog",
            nome: "Jadlog Express",
            preco: 29.90,
            prazo: "4 a 8 dias úteis"
        });

        freteInfo.style.color = estadoDestino === "SC" ? "green" : "black";
        freteInfo.textContent = `Opções de envio para ${cidadeDestino} - ${estadoDestino}:`;

        opcoes.forEach((opt, idx) => {
            const li = document.createElement("li");
            const precoStr = opt.preco === 0 ? "Grátis" : `R$${opt.preco.toFixed(2)}`;
            li.innerHTML = `
                <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    <input type="radio" name="frete-opcao" value="${opt.id}" ${idx === 0 ? "checked" : ""}>
                    ${opt.nome} — <strong>${precoStr}</strong> — ${opt.prazo}
                </label>
            `;
            freteOpcoesElem.appendChild(li);
        });

        freteOpcoesElem.style.display = "block";

        frete = opcoes[0].preco;

        const radios = freteOpcoesElem.querySelectorAll('input[name="frete-opcao"]');
        radios.forEach(radio => {
            radio.addEventListener("change", () => {
                const optSelecionada = opcoes.find(o => o.id === radio.value);
                if (optSelecionada) {
                    frete = optSelecionada.preco;
                    renderCart();
                }
            });
        });

        renderCart();

    } catch (error) {
        console.error("Erro no fetch CEP:", error);
        freteInfo.style.color = "red";
        freteInfo.textContent = "Erro ao consultar o CEP.";
    }
}

function aplicarCupom() {
    const cupomInput = document.getElementById("cupom").value.trim().toUpperCase();
    const cupomInfoElem = document.getElementById("cupom-info");

    const cupons = {
        "RAUPP5": 5,
        "PANTANAL10": 10
    };

    if (cupons[cupomInput]) {
        appliedDiscount = cupons[cupomInput];
        cupomInfoElem.style.color = "green";
        cupomInfoElem.textContent = `Cupom aplicado: ${appliedDiscount}% OFF`;
    } else {
        appliedDiscount = 0;
        cupomInfoElem.style.color = "red";
        cupomInfoElem.textContent = "Cupom inválido";
    }

    renderCart(true);
}
