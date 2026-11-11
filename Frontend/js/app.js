/* ============================================================
   COPA DEL MARE — Logique applicative (routing, panier, auth)
   ============================================================ */

/* ---------- STATE ---------- */
const state = {
  cart: JSON.parse(localStorage.getItem('copa_cart') || '[]'),
  currentProduct: null,
  currentQty: 1,
  currentCategory: 'Tout',
  user: JSON.parse(localStorage.getItem('copa_user') || 'null')
};

const saveCart = () => localStorage.setItem('copa_cart', JSON.stringify(state.cart));
const saveUser = () => localStorage.setItem('copa_user', JSON.stringify(state.user));

/* ---------- ROUTING ---------- */
function showPage(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
  const el = document.getElementById(id);
  if (el) el.classList.add('on');
  document.querySelectorAll('.subnav button').forEach(b =>
    b.classList.toggle('on', b.dataset.page === id)
  );
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setMode(mode) {
  document.body.className = 'mode-' + mode;
  document.querySelectorAll('.mode-switch button').forEach(b =>
    b.classList.toggle('on', b.dataset.mode === mode)
  );
  showPage(mode === 'public' ? 'accueil' : 'salle');
}

/* Délégation globale : tout élément avec data-page navigue */
document.addEventListener('click', e => {
  const target = e.target.closest('[data-page]');
  if (target) {
    e.preventDefault();
    showPage(target.dataset.page);
  }
});

/* ---------- PRODUITS ---------- */
function productCard(p, isSignature = false) {
  return `
    <div class="prod" data-product-id="${p.id}">
      <div class="prod-img">${p.emoji}</div>
      <div class="prod-body">
        <h3>${p.name}</h3>
        <p>${p.desc.substring(0, 40)}…</p>
        <div class="prod-foot">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn sm" data-add-id="${p.id}">Ajouter</button>
        </div>
      </div>
    </div>`;
}

function renderMenu(category = 'Tout') {
  state.currentCategory = category;
  const list = category === 'Tout'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);
  document.getElementById('menuGrid').innerHTML = list.map(p => productCard(p)).join('');
  document.querySelectorAll('#categoryFilters button').forEach(b =>
    b.classList.toggle('on', b.dataset.cat === category)
  );
}

function renderSignature() {
  document.getElementById('signatureGrid').innerHTML =
    PRODUCTS.filter(p => SIGNATURE_IDS.includes(p.id)).map(p => productCard(p, true)).join('');
}

function renderAdminMenu() {
  document.getElementById('adminMenuGrid').innerHTML = PRODUCTS.map(p => `
    <div class="card" style="padding:12px;cursor:pointer" data-add-id="${p.id}">
      <b>${p.name}</b><br>
      <span style="font-size:11px;color:var(--gris)">${p.category} · ${formatPrice(p.price)}</span>
    </div>`).join('');
}

/* ---------- FILTRES ---------- */
function renderFilters() {
  document.getElementById('categoryFilters').innerHTML = CATEGORIES.map(c =>
    `<button data-cat="${c}" ${c === 'Tout' ? 'class="on"' : ''}>${c}</button>`
  ).join('');
}

/* ---------- DÉTAIL PRODUIT ---------- */
function showProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  state.currentProduct = p;
  state.currentQty = 1;
  document.getElementById('pName').textContent = p.name;
  document.getElementById('pPrice').textContent = formatPrice(p.price);
  document.getElementById('pCat').textContent = p.category;
  document.getElementById('pDesc').textContent = p.desc;
  document.getElementById('pImg').textContent = p.emoji;
  document.getElementById('pQty').textContent = '1';
  document.getElementById('pNote').value = '';
  updateProductTotal();
  showPage('produit');
}

function updateProductTotal() {
  if (!state.currentProduct) return;
  document.getElementById('pTotal').textContent =
    formatPrice(state.currentProduct.price * state.currentQty);
}

/* ---------- PANIER ---------- */
function addToCart(productId, qty = 1, note = '', cook = '') {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const key = `${productId}|${cook}|${note}`;
  const existing = state.cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      key, id: p.id, name: p.name, emoji: p.emoji,
      price: p.price, qty, note, cook
    });
  }
  saveCart();
  updateCartUI();
  toast(`${p.name} ajouté au panier ✓`);
}

function removeFromCart(key) {
  state.cart = state.cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
}

function changeQty(key, delta) {
  const item = state.cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(key);
  else { saveCart(); updateCartUI(); }
}

function cartSubtotal() {
  return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function cartDiscount() {
  return state.user ? SHOP_CONFIG.loyaltyDiscount : 0;
}

function cartTotal() {
  const sub = cartSubtotal();
  if (sub === 0) return 0;
  return sub + SHOP_CONFIG.deliveryFee - cartDiscount();
}

function updateCartUI() {
  // Badge compteur
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  // Liste panier
  const list = document.getElementById('cartItems');
  if (state.cart.length === 0) {
    list.innerHTML = `<p class="muted" style="text-align:center;padding:20px">Votre panier est vide.<br><a href="#" data-page="menu">Découvrir le menu →</a></p>`;
  } else {
    list.innerHTML = state.cart.map(i => `
      <div class="cart-item">
        <div class="cart-item-img">${i.emoji}</div>
        <div class="cart-item-info">
          <h4>${i.name}</h4>
          <small>${[i.cook, i.note].filter(Boolean).join(' · ') || '—'}</small>
          <div class="qty">
            <button data-qty-key="${i.key}" data-delta="-1">−</button>
            <span>${i.qty}</span>
            <button data-qty-key="${i.key}" data-delta="1">+</button>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(i.price * i.qty)}</div>
      </div>`).join('');
  }

  // Totaux
  const sub = cartSubtotal();
  document.getElementById('cartSubtotal').textContent = formatPrice(sub);
  document.getElementById('cartDelivery').textContent = sub > 0 ? formatPrice(SHOP_CONFIG.deliveryFee) : '0 F';
  document.getElementById('cartDiscount').textContent = '−' + formatPrice(cartDiscount());
  document.getElementById('cartTotal').textContent = formatPrice(cartTotal());

  // Checkout
  const coSub = document.getElementById('coSubtotal');
  if (coSub) {
    coSub.textContent = formatPrice(sub);
    document.getElementById('coTotal').textContent = formatPrice(cartTotal());
  }

  // Admin commande
  const adminList = document.getElementById('adminCartItems');
  if (adminList) {
    adminList.innerHTML = state.cart.length
      ? state.cart.map(i => `
        <div class="totals-row" style="padding:10px 0;border-bottom:1px dashed #ddd">
          <span>${i.name} ×${i.qty}</span>
          <span>${formatPrice(i.price * i.qty)}</span>
        </div>`).join('')
      : '<p class="muted" style="padding:10px 0">Panier vide</p>';
    document.getElementById('adminCartTotal').textContent = formatPrice(cartSubtotal());
  }
}

/* ---------- TOAST ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

/* ---------- AUTH (mock) ---------- */
function updateAuthUI() {
  const btn = document.getElementById('btnAuth');
  btn.textContent = state.user ? '👤 ' + state.user.prenom : 'Connexion';
  btn.dataset.page = state.user ? 'compte' : 'connexion';
}

/* ---------- TABLES (admin) ---------- */
function renderTables() {
  document.getElementById('tablesGrid').innerHTML = TABLES.map(t => `
    <div class="stat-card">
      <div class="t">${t.num} · ${t.zone} · ${t.couverts} couverts</div>
      <div class="big">${t.info}</div>
      <span class="tag ${t.status}">${t.status === 'libre' ? 'Libre' : t.status === 'occ' ? 'Occupée' : 'Réservée'}</span>
    </div>`).join('');
}

/* ---------- ÉCOUTEURS GLOBAUX ---------- */
document.addEventListener('click', e => {
  // Clic sur une carte produit → ouvrir la fiche
  const prodCard = e.target.closest('[data-product-id]');
  if (prodCard) {
    showProduct(+prodCard.dataset.productId);
    return;
  }
  // Clic sur "Ajouter" rapide
  const addBtn = e.target.closest('[data-add-id]');
  if (addBtn) {
    e.stopPropagation();
    addToCart(+addBtn.dataset.addId, 1);
    return;
  }
  // Filtre catégorie
  const catBtn = e.target.closest('#categoryFilters button');
  if (catBtn) {
    renderMenu(catBtn.dataset.cat);
    return;
  }
  // Quantité panier
  const qtyBtn = e.target.closest('[data-qty-key]');
  if (qtyBtn) {
    changeQty(qtyBtn.dataset.qtyKey, +qtyBtn.dataset.delta);
    return;
  }
});

/* ---------- INITIALISATION ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Navigation mode
  document.querySelectorAll('.mode-switch button').forEach(b => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  });
  // Logo
  document.querySelector('.logo').addEventListener('click', () => {
    setMode('public');
  });

  // Produits
  renderFilters();
  renderSignature();
  renderMenu('Tout');
  renderAdminMenu();
  renderTables();
  updateCartUI();
  updateAuthUI();

  // Détail produit
  document.getElementById('qMinus').addEventListener('click', () => {
    if (state.currentQty > 1) {
      state.currentQty--;
      document.getElementById('pQty').textContent = state.currentQty;
      updateProductTotal();
    }
  });
  document.getElementById('qPlus').addEventListener('click', () => {
    state.currentQty++;
    document.getElementById('pQty').textContent = state.currentQty;
    updateProductTotal();
  });
  document.getElementById('btnAddToCart').addEventListener('click', () => {
    addToCart(
      state.currentProduct.id,
      state.currentQty,
      document.getElementById('pNote').value.trim(),
      document.getElementById('pCook').value
    );
    showPage('panier');
  });

  // Confirmation commande
  document.getElementById('btnConfirmOrder').addEventListener('click', () => {
    if (state.cart.length === 0) {
      toast('Votre panier est vide !');
      return;
    }
    toast('Commande confirmée !');
    state.cart = [];
    saveCart();
    updateCartUI();
    setTimeout(() => showPage('suivi'), 800);
  });

  // Envoi cuisine (admin)
  document.getElementById('btnSendKitchen').addEventListener('click', () => {
    if (state.cart.length === 0) { toast('Panier vide'); return; }
    toast('Commande envoyée en cuisine ✓');
    state.cart = [];
    saveCart();
    updateCartUI();
  });

  // Réservation
  document.getElementById('btnResa').addEventListener('click', () => {
    toast('Réservation enregistrée ! Confirmation par SMS.');
  });

  // Contact
  document.getElementById('btnContact').addEventListener('click', () => {
    toast('Message envoyé ! Réponse sous 24h.');
  });

  // Auth
  document.getElementById('btnLogin').addEventListener('click', () => {
    state.user = { prenom: 'Elio', nom: 'Kadio' };
    saveUser();
    updateAuthUI();
    updateCartUI();
    toast('Connexion réussie !');
    showPage('compte');
  });
  document.getElementById('btnRegister').addEventListener('click', () => {
    state.user = { prenom: 'Elio', nom: 'Kadio' };
    saveUser();
    updateAuthUI();
    updateCartUI();
    toast('Compte créé !');
    showPage('compte');
  });
  document.getElementById('btnLogout').addEventListener('click', () => {
    state.user = null;
    saveUser();
    updateAuthUI();
    updateCartUI();
    toast('Déconnecté');
    showPage('accueil');
  });
});