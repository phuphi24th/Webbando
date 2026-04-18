/**
 * GourmetDash - Core Logic Script (SPA version)
 * Pure Vanilla JS
 */

// --- Data Constants ---
const PRODUCTS_KEY = 'products';
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const ORDERS_KEY = 'orders';

// --- Default Data ---
const defaultProducts = [
    { id: 1, name: 'Artisan Green Harvest', price: 28000, discount: 10, category: 'Starters', quantity: 50, sold: 15, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop' },
    { id: 2, name: 'Wagyu Truffle Burger', price: 145000, discount: 0, category: 'Main Course', quantity: 20, sold: 42, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop' },
    { id: 3, name: 'Salmon Quinoa Bowl', price: 42000, discount: 5, category: 'Main Course', quantity: 30, sold: 28, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop' },
    { id: 4, name: 'Handmade Carbonara', price: 36000, discount: 0, category: 'Main Course', quantity: 45, sold: 31, image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=600&auto=format&fit=crop' },
    { id: 5, name: 'Noir Lava Cake', price: 22000, discount: 15, category: 'Desserts', quantity: 25, sold: 19, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop' },
    { id: 6, name: 'Pacific Pearl Oysters', price: 54000, discount: 0, category: 'Seafood', quantity: 15, sold: 8, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop' },
];

const defaultUsers = [
    { username: 'admin', password: '123', fullname: 'Administrator', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
    { username: 'user', password: '123', fullname: 'Khách hàng mẫu', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
];

// --- Initialization ---
function initData() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
}
initData();

// --- Storage Helpers ---
function getProducts() { return JSON.parse(localStorage.getItem(PRODUCTS_KEY)); }
function setProducts(data) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data)); }
function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY)); }
function setUsers(data) { localStorage.setItem(USERS_KEY, JSON.stringify(data)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); }
function setCurrentUser(user) { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); }
function getOrders() { return JSON.parse(localStorage.getItem(ORDERS_KEY)); }
function setOrders(data) { localStorage.setItem(ORDERS_KEY, JSON.stringify(data)); }

// ===================== SPA Navigation =====================
let currentPage = 'home';

function navigate(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Scroll to top
    window.scrollTo(0, 0);

    currentPage = page;
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');

    // Update document title
    const titles = { home: 'GourmetDash | Ăn Ngon Mỗi Ngày', cart: 'Giỏ Hàng | GourmetDash', orders: 'Đơn Hàng | GourmetDash', login: 'Đăng Nhập | GourmetDash', register: 'Đăng Ký | GourmetDash', admin: 'Quản Trị | GourmetDash' };
    document.title = titles[page] || 'GourmetDash';

    // Body bg adjustment
    if (page === 'login' || page === 'register') {
        document.body.style.background = '';
    } else if (page === 'admin') {
        document.body.style.background = '#f8fafc';
    } else {
        document.body.style.background = '';
    }

    // Page-specific init
    updateHeader();
    if (page === 'home') {
        renderProducts();
        setupCategoryFilters();
        setupHomeSearch();
    }
    if (page === 'cart') {
        renderCart();
        renderHeaderForPage('cartHeaderActions');
    }
    if (page === 'orders') {
        renderUserOrders();
        renderHeaderForPage('ordersHeaderActions');
    }
    if (page === 'admin') {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            showToast('Bạn không có quyền truy cập trang quản trị!');
            navigate('home');
            return;
        }
        initAdmin();
    }
    if (page === 'login') {
        setupLoginForm();
    }
    if (page === 'register') {
        setupRegisterForm();
    }

    if (window.lucide) lucide.createIcons();
    return false;
}

function renderHeaderForPage(containerId) {
    const user = getCurrentUser();
    const container = document.getElementById(containerId);
    if (!container) return;
    if (user) {
        let adminBtn = user.role === 'admin' ? `<a href="#" onclick="navigate('admin')" class="flex items-center gap-2 text-primary font-bold hover:bg-orange-50 px-4 py-2 rounded-full transition-all"><i data-lucide="layout-dashboard" class="w-4 h-4"></i> Admin</a>` : '';
        container.innerHTML = `
            ${adminBtn}
            <div class="flex items-center gap-3 cursor-pointer group relative" id="profileTrigger-${containerId}">
                <span class="font-bold text-on-surface group-hover:text-primary transition-colors hidden sm:block">${user.fullname}</span>
                <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-primary transition-all">
                    <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" class="w-full h-full object-cover">
                </div>
                <div class="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl p-2 hidden group-hover:block animate-slideUp z-50">
                    <a href="#" onclick="navigate('orders')" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 font-bold transition-all"><i data-lucide="package" class="w-4 h-4"></i> Đơn hàng</a>
                    <div class="px-4 py-3 border-t border-slate-100">
                        <label class="flex items-center gap-3 w-full cursor-pointer hover:bg-slate-50 transition-all">
                            <i data-lucide="camera" class="w-4 h-4 text-slate-400"></i>
                            <span class="text-xs font-bold text-slate-400">Đổi ảnh đại diện</span>
                            <input type="file" accept="image/*" class="hidden" onchange="changeAvatar(this)">
                        </label>
                    </div>
                    <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bold transition-all"><i data-lucide="log-out" class="w-4 h-4"></i> Đăng xuất</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<a href="#" onclick="navigate('login')" class="bg-primary-container text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all active:scale-95">Đăng nhập</a>`;
    }
}

// --- Global UI Logic ---
function updateHeader() {
    const user = getCurrentUser();
    const container = document.getElementById('userProfile');
    if (!container) return;

    if (user) {
        let adminBtn = user.role === 'admin' ? `<a href="#" onclick="navigate('admin')" class="flex items-center gap-2 text-primary font-bold hover:bg-orange-50 px-4 py-2 rounded-full transition-all"><i data-lucide="layout-dashboard" class="w-4 h-4"></i> Admin</a>` : '';
        container.innerHTML = `
            ${adminBtn}
            <div class="flex items-center gap-3 ml-2 cursor-pointer group relative" id="profileTrigger">
                <span class="font-bold text-on-surface group-hover:text-primary transition-colors hidden sm:block">${user.fullname}</span>
                <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-primary transition-all">
                    <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" class="w-full h-full object-cover">
                </div>
                <div class="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl p-2 hidden group-hover:block animate-slideUp z-50">
                    <a href="#" onclick="navigate('orders')" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 font-bold transition-all"><i data-lucide="package" class="w-4 h-4"></i> Đơn hàng</a>
                    <div class="px-4 py-3 border-t border-slate-100">
                        <label class="flex items-center gap-3 w-full cursor-pointer hover:bg-slate-50 transition-all">
                            <i data-lucide="camera" class="w-4 h-4 text-slate-400"></i>
                            <span class="text-xs font-bold text-slate-400">Đổi ảnh đại diện</span>
                            <input type="file" accept="image/*" class="hidden" onchange="changeAvatar(this)">
                        </label>
                    </div>
                    <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bold transition-all"><i data-lucide="log-out" class="w-4 h-4"></i> Đăng xuất</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<a href="#" onclick="navigate('login')" class="bg-primary-container text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all active:scale-95">Đăng nhập</a>`;
    }

    // Cart Count
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        const cartKey = user ? `cart_${user.username}` : 'cart_guest';
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = count;
        if (count > 0) cartCountEl.classList.remove('hidden');
        else cartCountEl.classList.add('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('Đã đăng xuất thành công.');
    setTimeout(() => navigate('home'), 1000);
}

function changeAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const user = getCurrentUser();
            user.avatar = e.target.result;
            setCurrentUser(user);
            const users = getUsers();
            const index = users.findIndex(u => u.username === user.username);
            if (index !== -1) {
                users[index].avatar = e.target.result;
                setUsers(users);
            }
            showToast('Đã cập nhật ảnh đại diện.');
            updateHeader();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- Auth Simulation ---
function simulateGoogleLogin() {
    const googleUser = {
        username: 'google_user_' + Date.now(),
        fullname: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
        role: 'user'
    };
    setCurrentUser(googleUser);
    const users = getUsers();
    users.push(googleUser);
    setUsers(users);
    showToast('Đăng nhập bằng Google thành công!');
    setTimeout(() => navigate('home'), 1500);
}

// --- Toast System ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Menu Logic ---
let currentCategory = 'All';
let categoryFiltersSetup = false;

function setupCategoryFilters() {
    if (categoryFiltersSetup) return;
    categoryFiltersSetup = true;
    const cats = ['Discount', 'Starters', 'Main Course', 'Seafood', 'Desserts', 'Drinks'];
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;
    cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'category-btn px-6 py-2 rounded-full border border-slate-200 font-bold hover:border-primary transition-all bg-white text-on-surface';
        if (c === 'Discount') btn.textContent = 'Đang giảm giá';
        else if (c === 'Starters') btn.textContent = 'Khai vị';
        else if (c === 'Main Course') btn.textContent = 'Món chính';
        else if (c === 'Seafood') btn.textContent = 'Hải sản';
        else if (c === 'Desserts') btn.textContent = 'Tráng miệng';
        else btn.textContent = 'Đồ uống';
        btn.onclick = () => filterCategory(c);
        filterContainer.appendChild(btn);
    });
}

let homeSearchSetup = false;
function setupHomeSearch() {
    if (homeSearchSetup) return;
    homeSearchSetup = true;
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderProducts());
    }
}

function filterCategory(cat) {
    currentCategory = cat;
    renderProducts();
    const btns = document.querySelectorAll('.category-btn');
    btns.forEach(btn => {
        const btnText = btn.textContent.trim();
        const isMatch = (cat === 'All' && btnText === 'Tất cả') ||
                        (cat === 'Discount' && btnText === 'Đang giảm giá') ||
                        (btnText === (cat === 'Starters' ? 'Khai vị' : cat === 'Main Course' ? 'Món chính' : cat === 'Seafood' ? 'Hải sản' : cat === 'Desserts' ? 'Tráng miệng' : cat === 'Drinks' ? 'Đồ uống' : cat));
        if (isMatch) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function sortProducts() {
    renderProducts();
}

const getFinalPrice = (p) => Math.round(Number(p.price) * (1 - (Number(p.discount) || 0) / 100));

function renderProducts() {
    const rawProducts = getProducts();
    const products = rawProducts.filter((item, index, self) =>
        index === self.findIndex(p => p.id === item.id)
    );
    const grid = document.getElementById('productGrid');
    const hotGrid = document.getElementById('hotGrid');
    const hotSection = document.getElementById('hotSection');
    const discountGrid = document.getElementById('discountGrid');
    const discountSection = document.getElementById('discountSection');
    const searchVal = (document.getElementById('mainSearch')?.value || '').toLowerCase();
    const sortVal = document.getElementById('priceSort')?.value || 'none';
    if (!grid) return;

    const isDiscounted = (p) => (Number(p.discount) > 0) || (p.couponCode && p.couponCode.trim() !== '');

    let baseFiltered = [];
    if (currentCategory === 'All') {
        baseFiltered = products.filter(p => !isDiscounted(p));
        if (discountSection) discountSection.classList.add('hidden');
    } else if (currentCategory === 'Discount') {
        baseFiltered = products.filter(p => isDiscounted(p));
        if (discountSection) discountSection.classList.add('hidden');
    } else {
        baseFiltered = products.filter(p => p.category === currentCategory);
        if (discountSection) discountSection.classList.add('hidden');
    }

    const searchFiltered = baseFiltered.filter(p => p.name.toLowerCase().includes(searchVal));

    const sortedItems = [...searchFiltered].sort((a, b) => {
        const priceA = getFinalPrice(a);
        const priceB = getFinalPrice(b);
        if (sortVal === 'asc') return priceA - priceB;
        if (sortVal === 'desc') return priceB - priceA;
        return 0;
    });

    if (currentCategory === 'All' && searchVal === '') {
        const hotItems = products.filter(p => p.isHot && !isDiscounted(p));
        if (hotGrid && hotSection) {
            if (hotItems.length > 0) {
                hotSection.classList.remove('hidden');
                hotGrid.innerHTML = hotItems.map(p => createProductCard(p)).join('');
            } else {
                hotSection.classList.add('hidden');
            }
        }
    } else {
        if (hotSection) hotSection.classList.add('hidden');
    }

    if (sortedItems.length === 0) {
        grid.innerHTML = '';
        document.getElementById('noResults').classList.remove('hidden');
    } else {
        grid.innerHTML = sortedItems.map(p => createProductCard(p)).join('');
        document.getElementById('noResults').classList.add('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

function createProductCard(p) {
    const finalPrice = Math.round(p.price * (1 - p.discount / 100));
    const discountBadge = p.discount > 0 ? `<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg z-10">-${p.discount}%</div>` : '';
    const hotBadge = p.isHot ? `<div class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg z-10">HOT</div>` : '';
    const couponBadge = p.couponCode ? `<div class="absolute bottom-4 left-4 bg-blue-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10 shadow-sm">${p.couponCode}</div>` : '';
    return `
        <div class="food-card group bg-white rounded-3xl shadow-sm overflow-hidden relative border border-slate-50">
            ${discountBadge}
            ${hotBadge}
            <div class="aspect-[4/3] overflow-hidden relative">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                ${couponBadge}
            </div>
            <div class="p-6">
                <div class="mb-2">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">${p.category}</span>
                    <h4 class="text-lg font-headline font-bold text-on-surface truncate">${p.name}</h4>
                </div>
                <div class="flex items-end justify-between">
                    <div>
                        ${p.discount > 0 ? `<span class="text-xs text-slate-400 line-through block">${p.price.toLocaleString('vi-VN')}₫</span>` : ''}
                        <span class="text-xl font-black text-primary">${finalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-primary-container text-white p-3 rounded-full hover:scale-110 transition-all click-effect shadow-lg shadow-orange-500/20">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Cart Logic ---
function addToCart(id) {
    const user = getCurrentUser();
    const cartKey = user ? `cart_${user.username}` : 'cart_guest';
    const products = getProducts();
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].qty++;
    } else {
        cart.push({ ...prod, qty: 1 });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    showToast(`Đã thêm ${prod.name} vào giỏ!`);
    updateHeader();
}

function renderCart() {
    const user = getCurrentUser();
    const cartKey = user ? `cart_${user.username}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="py-20 text-center text-slate-400">Giỏ hàng trống.</div>`;
        updateSummary();
        return;
    }

    container.innerHTML = cart.map((item, idx) => {
        const itemPrice = item.price;
        const finalItemPrice = Math.round(itemPrice * (1 - (item.discount || 0) / 100));
        return `
            <div class="bg-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 items-center">
                <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src="${item.image}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h3 class="font-headline font-bold text-xl">${item.name}</h3>
                    <p class="text-slate-400 text-sm">${item.category}</p>
                    <div class="mt-1 flex items-center gap-2">
                        <span class="text-primary font-bold">${finalItemPrice.toLocaleString('vi-VN')}₫</span>
                        ${item.discount > 0 ? `<span class="text-[10px] text-slate-400 line-through">${itemPrice.toLocaleString('vi-VN')}₫</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full">
                    <button onclick="updateCartQty(${idx}, -1)" class="hover:text-primary transition-colors"><i data-lucide="minus" class="w-4 h-4"></i></button>
                    <span class="font-bold w-6 text-center">${item.qty}</span>
                    <button onclick="updateCartQty(${idx}, 1)" class="hover:text-primary transition-colors"><i data-lucide="plus" class="w-4 h-4"></i></button>
                </div>
                <div class="text-right flex flex-col items-end">
                    <p class="font-black text-xl text-on-surface">${(finalItemPrice * item.qty).toLocaleString('vi-VN')}₫</p>
                    <button onclick="removeFromCart(${idx})" class="text-red-400 hover:text-red-500 text-xs font-bold mt-2 uppercase tracking-widest">Xóa</button>
                </div>
            </div>
        `;
    }).join('');

    updateSummary();

    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    const input = document.getElementById('couponInput');
    const msgEl = document.getElementById('couponMessage');
    if (appliedCoupon && input && msgEl) {
        input.value = appliedCoupon.code;
        msgEl.textContent = `Mã đang áp dụng: ${appliedCoupon.code} (-${appliedCoupon.percent}%)`;
        msgEl.classList.remove('hidden', 'text-red-500');
        msgEl.classList.add('text-green-500');
    }

    if (window.lucide) lucide.createIcons();

    // Auto-fill form
    if (user && user.shippingInfo) {
        const fn = document.getElementById('order-fullname');
        const ph = document.getElementById('order-phone');
        const ad = document.getElementById('order-address');
        if (fn && !fn.value) fn.value = user.shippingInfo.fullname;
        if (ph && !ph.value) ph.value = user.shippingInfo.phone;
        if (ad && !ad.value) ad.value = user.shippingInfo.address;
    }
}

function updateCartQty(idx, delta) {
    const user = getCurrentUser();
    const cartKey = user ? `cart_${user.username}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey));
    cart[idx].qty += delta;
    if (cart[idx].qty < 1) cart[idx].qty = 1;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    updateHeader();
}

function removeFromCart(idx) {
    const user = getCurrentUser();
    const cartKey = user ? `cart_${user.username}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey));
    cart.splice(idx, 1);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    updateHeader();
    showToast('Đã xóa sản phẩm khỏi giỏ.');
}

function updateSummary() {
    const user = getCurrentUser();
    const cartKey = user ? `cart_${user.username}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const subtotalEl = document.getElementById('subtotal');
    const totalCostEl = document.getElementById('totalCost');
    const discountRow = document.getElementById('discountRow');
    const discountAmountEl = document.getElementById('discountAmount');
    const discountLabelEl = document.getElementById('discountLabel');
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    const originalSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let finalTotal = 0;
    let totalDiscount = 0;
    if (appliedCoupon) {
        finalTotal = cart.reduce((sum, item) => {
            const itemPriceAfterCoupon = Math.round(item.price * (1 - appliedCoupon.percent / 100));
            return sum + (itemPriceAfterCoupon * item.qty);
        }, 0);
        totalDiscount = originalSubtotal - finalTotal;
        if (discountRow) {
            discountRow.classList.remove('hidden');
            discountLabelEl.textContent = `Coupon: ${appliedCoupon.code} (${appliedCoupon.percent}%)`;
            discountAmountEl.textContent = `-${totalDiscount.toLocaleString('vi-VN')}₫`;
        }
    } else {
        finalTotal = cart.reduce((sum, item) => {
            const currentItemPrice = Math.round(item.price * (1 - (item.discount || 0) / 100));
            return sum + (currentItemPrice * item.qty);
        }, 0);
        totalDiscount = originalSubtotal - finalTotal;
        if (totalDiscount > 0) {
            if (discountRow) {
                discountRow.classList.remove('hidden');
                discountLabelEl.textContent = `Ưu đãi giảm giá`;
                discountAmountEl.textContent = `-${totalDiscount.toLocaleString('vi-VN')}₫`;
            }
        } else {
            if (discountRow) discountRow.classList.add('hidden');
        }
    }
    if (subtotalEl) subtotalEl.textContent = originalSubtotal.toLocaleString('vi-VN') + '₫';
    if (totalCostEl) totalCostEl.textContent = finalTotal.toLocaleString('vi-VN') + '₫';
}

function applyCoupon() {
    const input = document.getElementById('couponInput');
    const msgEl = document.getElementById('couponMessage');
    const code = input.value.toUpperCase().trim();
    if (!code) { showToast('Vui lòng nhập mã giảm giá.'); return; }
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const coupon = coupons.find(c => c.code === code);
    msgEl.classList.remove('hidden', 'text-green-500', 'text-red-500');
    if (!coupon) {
        msgEl.textContent = 'Mã không tồn tại!';
        msgEl.classList.add('text-red-500');
        sessionStorage.removeItem('appliedCoupon');
        renderCart(); return;
    }
    if (!coupon.active) {
        msgEl.textContent = 'Mã không khả dụng!';
        msgEl.classList.add('text-red-500');
        sessionStorage.removeItem('appliedCoupon');
        renderCart(); return;
    }
    const now = new Date().getTime();
    const start = new Date(coupon.start).getTime();
    const end = new Date(coupon.end).getTime();
    if (now < start) {
        msgEl.textContent = 'Mã chưa đến thời gian áp dụng!';
        msgEl.classList.add('text-red-500');
        sessionStorage.removeItem('appliedCoupon');
        renderCart(); return;
    }
    if (now > end) {
        msgEl.textContent = 'Mã đã hết hạn!';
        msgEl.classList.add('text-red-500');
        sessionStorage.removeItem('appliedCoupon');
        renderCart(); return;
    }
    msgEl.textContent = `Áp dụng thành công mã ${code}! Giảm ${coupon.percent}%`;
    msgEl.classList.add('text-green-500');
    sessionStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    renderCart();
    showToast('Đã áp dụng mã giảm giá!');
}

function processCheckout() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Vui lòng đăng nhập để thanh toán.');
        setTimeout(() => navigate('login'), 1500);
        return;
    }
    const name = document.getElementById('order-fullname').value;
    const phone = document.getElementById('order-phone').value;
    const address = document.getElementById('order-address').value;
    if (!name || !phone || !address) { showToast('Vui lòng điền đầy đủ thông tin giao hàng.'); return; }
    user.shippingInfo = { fullname: name, phone: phone, address: address };
    setCurrentUser(user);
    const users = getUsers();
    const uIdx = users.findIndex(u => u.username === user.username);
    if (uIdx !== -1) { users[uIdx].shippingInfo = user.shippingInfo; setUsers(users); }
    const cartKey = `cart_${user.username}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (cart.length === 0) { showToast('Giỏ hàng trống!'); return; }
    const originalSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const appliedCoupon = JSON.parse(sessionStorage.getItem('appliedCoupon'));
    let finalTotal = 0;
    let discountAmount = 0;
    if (appliedCoupon) {
        finalTotal = cart.reduce((sum, item) => {
            const itemPriceAfterCoupon = Math.round(item.price * (1 - appliedCoupon.percent / 100));
            return sum + (itemPriceAfterCoupon * item.qty);
        }, 0);
        discountAmount = originalSubtotal - finalTotal;
    } else {
        finalTotal = cart.reduce((sum, item) => {
            const currentItemPrice = Math.round(item.price * (1 - (item.discount || 0) / 100));
            return sum + (currentItemPrice * item.qty);
        }, 0);
        discountAmount = originalSubtotal - finalTotal;
    }
    const orderId = 'GD' + Date.now().toString().slice(-6);
    const newOrder = {
        id: orderId,
        user: user.username,
        fullname: name,
        phone: phone,
        address: address,
        items: cart,
        subtotal: originalSubtotal,
        total: finalTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountPercent: appliedCoupon ? appliedCoupon.percent : 0,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        date: new Date().toLocaleString('vi-VN'),
        status: 'pending'
    };
    const orders = getOrders();
    orders.push(newOrder);
    setOrders(orders);
    const products = getProducts();
    cart.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.id);
        if (pIdx !== -1) {
            products[pIdx].sold += item.qty;
            products[pIdx].quantity -= item.qty;
            if (products[pIdx].quantity < 0) products[pIdx].quantity = 0;
        }
    });
    setProducts(products);
    localStorage.removeItem(cartKey);
    sessionStorage.removeItem('appliedCoupon');
    showToast('Thanh toán thành công! Đang chuyển đến trang đơn hàng...');
    setTimeout(() => navigate('orders'), 2000);
}

// --- User Orders Logic ---
function renderUserOrders() {
    const user = getCurrentUser();
    if (!user) { navigate('login'); return; }
    const orders = getOrders().filter(o => o.user === user.username).reverse();
    const list = document.getElementById('orderList');
    if (!list) return;
    if (orders.length === 0) {
        document.getElementById('emptyOrders').classList.remove('hidden');
        list.classList.add('hidden');
        return;
    }
    list.classList.remove('hidden');
    document.getElementById('emptyOrders').classList.add('hidden');
    list.innerHTML = orders.map(o => `
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID: ${o.id}</span>
                    <p class="font-bold text-on-surface">${o.date}</p>
                </div>
                <div class="text-right">
                    <span class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest 
                        ${o.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                          o.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                          o.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                          o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                        ${o.status === 'pending' ? 'Chờ xác nhận' :
                          o.status === 'processing' ? 'Đang chuẩn bị' :
                          o.status === 'shipped' ? 'Đang giao' :
                          o.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                    </span>
                </div>
            </div>
            <div class="p-8 space-y-6">
                ${o.items.map(item => `
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" class="w-16 h-16 rounded-xl object-cover">
                        <div class="flex-1">
                            <h4 class="font-bold">${item.name}</h4>
                            <p class="text-xs text-slate-400">Số lượng: ${item.qty}</p>
                        </div>
                        <p class="font-bold">${(Math.round(item.price * (1 - item.discount / 100)) * item.qty).toLocaleString('vi-VN')}₫</p>
                    </div>
                `).join('')}
                <div class="border-t border-slate-100 pt-6 flex justify-between items-center">
                    <div class="text-sm text-slate-400">
                        Địa chỉ: <span class="text-on-surface font-medium">${o.address}</span>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-400 mb-1">Tổng cộng</p>
                        <p class="text-2xl font-black text-primary">${o.total.toLocaleString('vi-VN')}₫</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// --- Login Form ---
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.onsubmit = null;
    form.addEventListener('submit', function handler(e) {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        const users = getUsers();
        const user = users.find(user => user.username === u && user.password === p);
        if (user) {
            setCurrentUser(user);
            showToast('Đăng nhập thành công!');
            setTimeout(() => navigate('home'), 1500);
        } else {
            showToast('Sai tài khoản hoặc mật khẩu.');
        }
    });
}

// --- Register Form ---
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.onsubmit = null;
    form.addEventListener('submit', function handler(e) {
        e.preventDefault();
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const re = document.getElementById('reg-repassword').value;
        const f = document.getElementById('fullname').value;
        const users = getUsers();
        if (p !== re) { showToast('Mật khẩu không khớp.'); return; }
        if (users.some(user => user.username === u)) { showToast('Tên đăng nhập đã tồn tại.'); return; }
        const newUser = { username: u, password: p, fullname: f, role: 'user', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u}` };
        users.push(newUser);
        setUsers(users);
        showToast('Đăng ký thành công!');
        setTimeout(() => navigate('login'), 1500);
    });
}

// ===================== ADMIN LOGIC =====================

function initAdmin() {
    switchTab('dashboard');
    const admin = getCurrentUser();
    if (admin) {
        const adminProfile = document.getElementById('adminProfile');
        if (adminProfile) {
            adminProfile.innerHTML = `
                <img src="${admin.avatar}" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p class="font-bold text-sm">${admin.fullname}</p>
                    <p class="text-[10px] uppercase tracking-widest text-primary font-black">Super Admin</p>
                </div>
            `;
        }
    }
    // Attach admin form events each time admin page loads
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.onsubmit = handleProductFormSubmit;
    const couponForm = document.getElementById('couponForm');
    if (couponForm) couponForm.onsubmit = handleCouponFormSubmit;
    if (window.lucide) lucide.createIcons();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-r', 'from-orange-600', 'to-orange-400', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
        btn.classList.add('text-slate-500');
    });
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) tabEl.classList.remove('hidden');
    const activeBtn = Array.from(document.querySelectorAll('.admin-nav-btn')).find(btn => {
        const oc = btn.getAttribute('onclick');
        return oc && oc.includes(`'${tabId}'`);
    });
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-orange-600', 'to-orange-400', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
        activeBtn.classList.remove('text-slate-500');
    }
    if (tabId === 'dashboard') loadDashboard();
    if (tabId === 'products') renderAdminProducts();
    if (tabId === 'orders') renderAdminOrders();
    if (tabId === 'users') renderAdminUsers();
    if (tabId === 'coupons') renderAdminCoupons();
    if (tabId === 'statistics') switchStatsTab('products');
}

function switchStatsTab(subTab) {
    const pc = document.getElementById('stats-products-content');
    const rc = document.getElementById('stats-revenue-content');
    if (pc) pc.classList.add('hidden');
    if (rc) rc.classList.add('hidden');
    document.querySelectorAll('.stats-tab-btn').forEach(btn => btn.classList.remove('active', 'border-primary', 'text-primary'));
    const activeEl = document.getElementById(`stats-${subTab}-content`);
    if (activeEl) activeEl.classList.remove('hidden');
    const activeBtnEl = document.getElementById(`stats-nav-${subTab}`);
    if (activeBtnEl) activeBtnEl.classList.add('active', 'border-primary', 'text-primary');
    if (subTab === 'products') renderStatsProducts();
    if (subTab === 'revenue') renderStatsRevenue();
}

function loadDashboard() {
    const orders = getOrders();
    const products = getProducts();
    const totalOrdersEl = document.getElementById('stat-totalOrders');
    const totalProductsEl = document.getElementById('stat-totalProducts');
    const totalRevenueEl = document.getElementById('stat-totalRevenue');
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
    if (totalRevenueEl) totalRevenueEl.textContent = revenue.toLocaleString('vi-VN') + '₫';
}

function renderAdminProducts() {
    const products = getProducts();
    const list = document.getElementById('adminProductList');
    if (!list) return;
    list.innerHTML = products.map(p => `
        <tr class="group hover:bg-slate-100/50 transition-colors">
            <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                    <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover shadow-sm">
                    <div>
                        <div class="font-bold text-on-surface">${p.name}</div>
                        <div class="text-[10px] text-slate-400 uppercase font-black">${p.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6 text-center">
                <div class="font-bold text-primary">${p.price.toLocaleString('vi-VN')}₫</div>
            </td>
            <td class="px-8 py-6 text-center">
                <span class="text-[10px] font-bold text-slate-400 italic">Quản lý tại mục Coupon</span>
            </td>
            <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold ${p.quantity > 10 ? 'bg-green-100 text-green-600' : p.quantity > 0 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}">
                    ${p.quantity > 0 ? p.quantity + ' món' : 'Hết hàng'}
                </span>
            </td>
            <td class="px-8 py-6 text-center font-bold">${p.sold || 0}</td>
            <td class="px-8 py-6 text-center">
                <button onclick="toggleHot(${p.id})" class="p-2 rounded-full transition-all ${p.isHot ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-300'}">
                    <i data-lucide="flame" class="w-4 h-4"></i>
                </button>
            </td>
            <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="openProductModal(${p.id})" class="p-2 hover:bg-primary-container hover:text-white rounded-full transition-all text-slate-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all text-slate-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

let currentImageBase64 = '';
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageBase64 = e.target.result;
            document.getElementById('modal-image-preview').src = currentImageBase64;
            document.getElementById('preview-container').classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function openProductModal(id = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    modal.classList.remove('hidden');
    form.reset();
    currentImageBase64 = '';
    document.getElementById('preview-container').classList.add('hidden');
    document.getElementById('edit-id').value = id || '';
    document.getElementById('modalTitle').textContent = id ? 'Sửa món ăn' : 'Thêm món ăn mới';
    if (id) {
        const products = getProducts();
        const p = products.find(prod => prod.id === id);
        if (p) {
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-category').value = p.category;
            document.getElementById('p-quantity').value = p.quantity;
            currentImageBase64 = p.image;
            document.getElementById('modal-image-preview').src = p.image;
            document.getElementById('preview-container').classList.remove('hidden');
        }
    }
    form.onsubmit = handleProductFormSubmit;
    if (window.lucide) lucide.createIcons();
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('p-name').value;
    const price = parseInt(document.getElementById('p-price').value);
    const category = document.getElementById('p-category').value;
    const quantity = parseInt(document.getElementById('p-quantity').value);
    if (!currentImageBase64) { showToast('Vui lòng chọn ảnh món ăn.'); return; }
    const products = getProducts();
    if (id) {
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, category, quantity, image: currentImageBase64 };
        }
    } else {
        const newProduct = { id: Date.now(), name, price, category, quantity, sold: 0, isHot: false, image: currentImageBase64 };
        products.push(newProduct);
    }
    setProducts(products);
    closeProductModal();
    renderAdminProducts();
    showToast(id ? 'Đã cập nhật món ăn!' : 'Đã thêm món mới!');
}

function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    renderAdminProducts();
    showToast('Đã xóa món ăn.');
}

function toggleHot(id) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index].isHot = !products[index].isHot;
        setProducts(products);
        renderAdminProducts();
        showToast(products[index].isHot ? 'Đã đánh dấu sản phẩm Hot!' : 'Đã bỏ đánh dấu sản phẩm Hot.');
    }
}

function renderAdminOrders() {
    const orders = getOrders();
    const list = document.getElementById('adminOrderList');
    if (!list) return;
    list.innerHTML = orders.map(o => `
        <tr class="group hover:bg-slate-100/50 transition-colors">
            <td class="px-8 py-6 font-bold text-primary">#${o.id}</td>
            <td class="px-8 py-6 text-sm font-medium">${o.fullname}</td>
            <td class="px-8 py-6 text-center">
                <select onchange="updateOrderStatus('${o.id}', this.value)" class="text-[10px] font-black uppercase tracking-widest border-none rounded-full px-4 py-1.5 focus:ring-0
                    ${o.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      o.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                      o.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                      o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang chuẩn bị</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Đang giao</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                </select>
            </td>
            <td class="px-8 py-6 text-center font-bold">${o.total.toLocaleString('vi-VN')}₫</td>
            <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="viewOrderDetails('${o.id}')" class="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><i data-lucide="eye" class="w-4 h-4"></i></button>
                    <button onclick="deleteOrder('${o.id}')" class="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all text-slate-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = newStatus;
        setOrders(orders);
        showToast('Đã cập nhật trạng thái đơn hàng.');
        renderAdminOrders();
        loadDashboard();
    }
}

function viewOrderDetails(id) {
    const orders = getOrders();
    const o = orders.find(ord => ord.id === id);
    if (o) {
        const modal = document.getElementById('orderModal');
        const content = document.getElementById('orderDetailsContent');
        modal.classList.remove('hidden');
        content.innerHTML = `
            <div class="flex justify-between border-b border-slate-100 pb-4">
                <div>
                    <h3 class="font-bold text-lg">${o.fullname}</h3>
                    <p class="text-sm text-slate-400">${o.phone}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold text-primary">#${o.id}</p>
                    <p class="text-[10px] text-slate-400 font-bold">${o.date}</p>
                </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl text-sm">
                <p class="font-bold mb-1">Địa chỉ giao hàng:</p>
                <p class="text-slate-600">${o.address}</p>
            </div>
            <div class="space-y-4">
                ${o.items.map(item => `
                    <div class="flex justify-between items-center text-sm">
                        <span>${item.name} x${item.qty}</span>
                        <span class="font-bold">${(Math.round(item.price * (1 - item.discount / 100)) * item.qty).toLocaleString('vi-VN')}₫</span>
                    </div>
                `).join('')}
            </div>
            <div class="pt-4 border-t border-slate-100 flex justify-between items-end">
                <span class="font-bold">Tổng thanh toán:</span>
                <span class="text-2xl font-black text-primary">${o.total.toLocaleString('vi-VN')}₫</span>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

function closeOrderModal() {
    const m = document.getElementById('orderModal');
    if (m) m.classList.add('hidden');
}

function deleteOrder(id) {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    setOrders(filtered);
    renderAdminOrders();
    loadDashboard();
    showToast('Đã xóa đơn hàng.');
}

function renderAdminUsers() {
    const users = getUsers();
    const orders = getOrders();
    const list = document.getElementById('adminUserList');
    if (!list) return;
    list.innerHTML = users.map(u => {
        const totalOrders = orders.filter(o => o.user === u.username).length;
        return `
            <tr class="group hover:bg-slate-100/50 transition-colors">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                        <img src="${u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.username}" class="w-10 h-10 rounded-full object-cover">
                        <div class="font-bold">${u.fullname}</div>
                    </div>
                </td>
                <td class="px-8 py-6 italic text-slate-400">@${u.username}</td>
                <td class="px-8 py-6 text-center font-black text-primary">${totalOrders}</td>
                <td class="px-8 py-6 text-right">
                    <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary-container text-white' : 'bg-slate-100 text-slate-500'}">
                        ${u.role}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStatsProducts() {
    const products = getProducts();
    const orders = getOrders();
    const sortVal = document.getElementById('statsProductSort')?.value || 'sold-desc';
    const container = document.getElementById('topSellingList');
    if (!container) return;
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const productStats = products.map(p => {
        const soldFromOrders = deliveredOrders.reduce((sum, order) => {
            const item = order.items.find(i => i.id === p.id);
            return sum + (item ? item.qty : 0);
        }, 0);
        return { ...p, sold: soldFromOrders };
    });
    if (sortVal === 'sold-desc') productStats.sort((a, b) => b.sold - a.sold);
    if (sortVal === 'sold-asc') productStats.sort((a, b) => a.sold - b.sold);
    if (sortVal === 'name') productStats.sort((a, b) => a.name.localeCompare(b.name));
    if (productStats.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-400 py-10">Chưa có dữ liệu sản phẩm.</p>`;
        return;
    }
    const maxSold = Math.max(...productStats.map(p => p.sold)) || 1;
    container.innerHTML = productStats.map(p => `
        <div class="space-y-2">
            <div class="flex justify-between items-end">
                <div class="flex items-center gap-3">
                    <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover">
                    <div>
                        <p class="font-bold text-sm">${p.name} ${p.isHot ? '🔥' : ''}</p>
                        <p class="text-[10px] uppercase font-black text-slate-400">Tồn kho: ${p.quantity} | ${p.category}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs font-bold text-slate-400">Đã bán</p>
                    <p class="font-black text-primary">${p.sold}</p>
                </div>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-primary-gradient h-full rounded-full transition-all duration-1000" style="width: ${(p.sold / maxSold * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

function renderStatsRevenue() {
    const orders = getOrders();
    const delivered = orders.filter(o => o.status === 'delivered');
    const revenueByDate = {};
    delivered.forEach(o => {
        const dateMatch = o.date.match(/\d+\/\d+\/\d+/);
        const datePart = dateMatch ? dateMatch[0] : o.date.split(' ')[0];
        if (!revenueByDate[datePart]) revenueByDate[datePart] = { revenue: 0, count: 0 };
        revenueByDate[datePart].revenue += o.total;
        revenueByDate[datePart].count += 1;
    });
    const dates = Object.keys(revenueByDate).sort((a, b) => {
        const [d1, m1, y1] = a.split('/').map(Number);
        const [d2, m2, y2] = b.split('/').map(Number);
        return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });
    const now = new Date();
    const todayStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    let totalRev = 0, todayRev = 0, weekRev = 0, monthRev = 0;
    dates.forEach(dStr => {
        const rev = revenueByDate[dStr].revenue;
        totalRev += rev;
        const [d, m, y] = dStr.split('/').map(Number);
        const date = new Date(y, m - 1, d);
        if (dStr === todayStr) todayRev += rev;
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) monthRev += rev;
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        if (diffDays <= 7) weekRev += rev;
    });
    const revToday = document.getElementById('rev-today');
    const revWeek = document.getElementById('rev-week');
    const revMonth = document.getElementById('rev-month');
    const revTotal = document.getElementById('rev-total');
    if (revToday) revToday.textContent = todayRev.toLocaleString('vi-VN') + '₫';
    if (revWeek) revWeek.textContent = weekRev.toLocaleString('vi-VN') + '₫';
    if (revMonth) revMonth.textContent = monthRev.toLocaleString('vi-VN') + '₫';
    if (revTotal) revTotal.textContent = totalRev.toLocaleString('vi-VN') + '₫';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getDate()}/${yesterday.getMonth() + 1}/${yesterday.getFullYear()}`;
    const yesRev = revenueByDate[yesterdayStr] ? revenueByDate[yesterdayStr].revenue : 0;
    const trendEl = document.getElementById('rev-trend');
    if (trendEl) {
        if (yesRev === 0) {
            trendEl.innerHTML = `<span class="text-slate-400">Chưa có dữ liệu hôm qua</span>`;
        } else {
            const diff = todayRev - yesRev;
            const percent = Math.abs((diff / yesRev) * 100).toFixed(1);
            if (diff > 0) trendEl.innerHTML = `<span class="text-green-500">▲ ${percent}% so với hôm qua</span>`;
            else if (diff < 0) trendEl.innerHTML = `<span class="text-red-500">▼ ${percent}% so với hôm qua</span>`;
            else trendEl.innerHTML = `<span class="text-slate-400">Bằng hôm qua</span>`;
        }
    }
    const tableBody = document.getElementById('revenueTableBody');
    if (tableBody) {
        tableBody.innerHTML = dates.map(d => `
            <tr class="hover:bg-slate-100/50">
                <td class="px-8 py-4 font-bold">${d}</td>
                <td class="px-8 py-4 text-slate-500">${revenueByDate[d].count} đơn</td>
                <td class="px-8 py-4 text-right font-black text-primary">${revenueByDate[d].revenue.toLocaleString('vi-VN')}₫</td>
            </tr>
        `).join('');
    }
}

function renderAdminCoupons() {
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const list = document.getElementById('adminCouponList');
    if (!list) return;
    if (coupons.length === 0) {
        list.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-slate-400 italic">Chưa có mã giảm giá nào.</td></tr>`;
        return;
    }
    const now = new Date().getTime();
    list.innerHTML = coupons.map(c => {
        const start = new Date(c.start).getTime();
        const end = new Date(c.end).getTime();
        const isExpired = now > end;
        const isWaiting = now < start;
        let statusHtml = '';
        if (isExpired) statusHtml = '<span class="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">HẾT HẠN</span>';
        else if (isWaiting) statusHtml = '<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">CHỜ CHẠY</span>';
        else if (!c.active) statusHtml = '<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">TẠM TẮT</span>';
        else statusHtml = '<span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">ĐANG CHẠY</span>';
        return `
            <tr class="group hover:bg-slate-100/50">
                <td class="px-8 py-6">
                    <div class="font-black text-primary uppercase text-lg">${c.code}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${c.id}</div>
                </td>
                <td class="px-8 py-6 text-center">
                    <div class="font-black text-red-500 text-xl">${c.percent}%</div>
                </td>
                <td class="px-8 py-6 text-center text-xs">
                    <div class="font-bold">${new Date(c.start).toLocaleDateString('vi-VN')}</div>
                    <div class="text-slate-300">đến</div>
                    <div class="font-bold">${new Date(c.end).toLocaleDateString('vi-VN')}</div>
                </td>
                <td class="px-8 py-6 text-center">
                    <span class="text-xs font-bold text-slate-500">${c.scope === 'all' ? 'Toàn sàn' : 'Sản phẩm chọn'}</span>
                </td>
                <td class="px-8 py-6 text-center">${statusHtml}</td>
                <td class="px-8 py-6 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="openCouponModal('${c.id}')" class="p-2 hover:bg-primary-container hover:text-white rounded-full transition-all text-slate-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                        <button onclick="deleteCoupon('${c.id}')" class="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all text-slate-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

function openCouponModal(id = null) {
    const modal = document.getElementById('couponModal');
    const form = document.getElementById('couponForm');
    modal.classList.remove('hidden');
    form.reset();
    document.getElementById('edit-coupon-id').value = id || '';
    document.getElementById('couponModalTitle').textContent = id ? 'Sửa mã giảm giá' : 'Tạo mã mới';
    if (id) {
        const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
        const c = coupons.find(item => item.id === id);
        if (c) {
            document.getElementById('c-code').value = c.code;
            document.getElementById('c-percent').value = [5, 10, 20, 30].includes(c.percent) ? c.percent : 'custom';
            if (document.getElementById('c-percent').value === 'custom') {
                document.getElementById('c-percent-custom').value = c.percent;
            }
            document.getElementById('c-start').value = c.start;
            document.getElementById('c-end').value = c.end;
            document.getElementById('c-scope').value = c.scope;
            document.getElementById('c-active').checked = c.active;
        }
    } else {
        const now = new Date();
        const later = new Date(now);
        later.setDate(now.getDate() + 7);
        document.getElementById('c-start').value = now.toISOString().split('T')[0];
        document.getElementById('c-end').value = later.toISOString().split('T')[0];
    }
    form.onsubmit = handleCouponFormSubmit;
    if (window.lucide) lucide.createIcons();
}

function closeCouponModal() {
    const m = document.getElementById('couponModal');
    if (m) m.classList.add('hidden');
}

function handleCouponFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-coupon-id').value;
    const code = document.getElementById('c-code').value.toUpperCase().trim();
    const percentType = document.getElementById('c-percent').value;
    const percent = percentType === 'custom' ? parseInt(document.getElementById('c-percent-custom').value) : parseInt(percentType);
    const start = document.getElementById('c-start').value;
    const end = document.getElementById('c-end').value;
    const scope = document.getElementById('c-scope').value;
    const active = document.getElementById('c-active').checked;
    if (isNaN(percent) || percent <= 0 || percent > 100) { showToast('Vui lòng nhập phần trăm giảm giá hợp lệ (1-100)'); return; }
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    if (id) {
        const index = coupons.findIndex(c => c.id === id);
        if (index !== -1) { coupons[index] = { ...coupons[index], code, percent, start, end, scope, active }; }
    } else {
        if (coupons.some(c => c.code === code)) { showToast('Mã này đã tồn tại!'); return; }
        coupons.push({ id: 'CP' + Date.now(), code, percent, start, end, scope, active });
    }
    localStorage.setItem('coupons', JSON.stringify(coupons));
    closeCouponModal();
    renderAdminCoupons();
    showToast(id ? 'Cập nhật mã thành công!' : 'Đã tạo mã mới!');
}

function deleteCoupon(id) {
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const filtered = coupons.filter(c => c.id !== id);
    localStorage.setItem('coupons', JSON.stringify(filtered));
    renderAdminCoupons();
    showToast('Đã xóa mã.');
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    navigate('home');
});
