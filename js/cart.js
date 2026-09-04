/* ============================================================
   Nkwen Traders - Shopping Cart
   Handles adding items, persisting the cart in localStorage,
   updating the cart badge, and rendering the cart page.
   ============================================================ */

const CART_STORAGE_KEY = "nkwenCart";

/* ---------- Storage helpers ---------- */

function getCart() {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}

/* ---------- Cart operations ---------- */

function addToCart(id, name, price, image) {
    const cart = getCart();

    if (cart[id]) {
        cart[id].qty += 1;
    } else {
        cart[id] = { name: name, price: price, image: image, qty: 1 };
    }

    saveCart(cart);
    flashAddedFeedback(id);
}

function setQuantity(id, qty) {
    const cart = getCart();
    if (!cart[id]) return;

    qty = Math.max(0, Math.min(99, Math.floor(qty) || 0));

    if (qty === 0) {
        delete cart[id];
    } else {
        cart[id].qty = qty;
    }

    saveCart(cart);
    renderCart();
}

function changeQuantity(id, delta) {
    const cart = getCart();
    if (!cart[id]) return;
    setQuantity(id, cart[id].qty + delta);
}

function removeFromCart(id) {
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
    renderCart();
}

function cartItemCount() {
    const cart = getCart();
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
    const cart = getCart();
    return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* ---------- UI: badge on the cart / hamburger buttons ---------- */

function updateCartBadge() {
    const cart = getCart();

    // Per-product badges: each product's cart button shows only how many
    // of THAT product are in the cart (not the whole cart's total).
    document.querySelectorAll(".product-actions").forEach(function (actions) {
        const addBtn = actions.querySelector(".add-to-cart");
        const badge = actions.querySelector(".cart-count");
        if (!addBtn || !badge) return;

        const id = addBtn.dataset.id;
        const qty = cart[id] ? cart[id].qty : 0;
        badge.textContent = qty;
        badge.style.display = qty > 0 ? "flex" : "none";
    });

    // Any standalone/global badge (e.g. one not tied to a specific product,
    // such as on the cart page itself) shows the overall cart total.
    document.querySelectorAll(".cart-count[data-global]").forEach(function (badge) {
        const count = cartItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
    });
}

function flashAddedFeedback(id) {
    const btn = document.querySelector('.add-to-cart[data-id="' + id + '"]');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = "Added \u2713";
    btn.disabled = true;
    setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
    }, 800);
}

/* ---------- UI: catalog page wiring ---------- */

function initCatalogButtons() {
    document.querySelectorAll(".add-to-cart").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const data = btn.dataset;
            addToCart(data.id, data.name, parseFloat(data.price), data.image);
        });
    });
}

/* ---------- UI: cart page rendering ---------- */

function formatFCFA(amount) {
    return Math.round(amount).toLocaleString("en-US") + " FCFA";
}

function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    const emptyMsg = document.getElementById("cart-empty");
    const totalEl = document.getElementById("cart-total-amount");
    const countEl = document.getElementById("cart-total-items");

    const cart = getCart();
    const ids = Object.keys(cart);

    container.innerHTML = "";

    if (ids.length === 0) {
        if (emptyMsg) emptyMsg.style.display = "block";
        container.style.display = "none";
    } else {
        if (emptyMsg) emptyMsg.style.display = "none";
        container.style.display = "flex";

        ids.forEach(function (id) {
            const item = cart[id];
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML =
                '<div class="cart-item-image">' +
                    '<img src="' + (item.image || "") + '" alt="' + item.name + '">' +
                '</div>' +
                '<div class="cart-item-info">' +
                    '<h3>' + item.name + '</h3>' +
                    '<p class="cart-item-unit-price">' + formatFCFA(item.price) + ' each</p>' +
                '</div>' +
                '<div class="qty-stepper">' +
                    '<button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">&#8722;</button>' +
                    '<input type="number" class="qty-input" min="0" max="99" value="' + item.qty + '" aria-label="Quantity for ' + item.name + '">' +
                    '<button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">&#43;</button>' +
                '</div>' +
                '<div class="cart-item-subtotal">' + formatFCFA(item.qty * item.price) + '</div>' +
                '<button type="button" class="cart-item-remove" aria-label="Remove ' + item.name + '">&times;</button>';

            row.querySelector(".qty-minus").addEventListener("click", function () { changeQuantity(id, -1); });
            row.querySelector(".qty-plus").addEventListener("click", function () { changeQuantity(id, 1); });
            row.querySelector(".qty-input").addEventListener("change", function (e) {
                setQuantity(id, parseInt(e.target.value, 10));
            });
            row.querySelector(".cart-item-remove").addEventListener("click", function () { removeFromCart(id); });

            container.appendChild(row);
        });
    }

    if (totalEl) totalEl.textContent = formatFCFA(cartTotal());
    if (countEl) countEl.textContent = cartItemCount();
}

/* ---------- Order placement (cart page) ---------- */

function placeOrder() {
    const msgEl = document.getElementById("order-confirmation");
    const cart = getCart();
    const ids = Object.keys(cart);

    if (ids.length === 0) {
        if (msgEl) {
            msgEl.textContent = "Your cart is empty \u2014 add some products before placing an order.";
            msgEl.className = "order-confirmation order-confirmation-error";
        }
        return;
    }

    const items = cartItemCount();
    const total = cartTotal();

    if (msgEl) {
        msgEl.textContent =
            "Thank you! Your order of " + items + " item(s) totaling " +
            formatFCFA(total) + " has been placed. We'll be in touch to arrange payment and delivery.";
        msgEl.className = "order-confirmation order-confirmation-success";
    }

    saveCart({});
    renderCart();
}

function initOrderButton() {
    const btn = document.getElementById("place-order-btn");
    if (btn) btn.addEventListener("click", placeOrder);
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", function () {
    updateCartBadge();
    initCatalogButtons();
    initOrderButton();
    renderCart();
});
