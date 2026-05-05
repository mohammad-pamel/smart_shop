let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 1000;
let cart = [];
let currentSlide = 0;

// Initialize 
document.addEventListener('DOMContentLoaded', () => {
    updateBalanceUI();
    fetchProducts();
    fetchReviews();
    startAutoSlider();
});

// Navbar & Balance 
function updateBalanceUI() {
    document.getElementById('balance-amount').innerText = balance;
    localStorage.setItem('balance', balance);
}

document.getElementById('add-money').addEventListener('click', () => {
    balance += 1000;
    updateBalanceUI();
});

// Sliding Banner
const slider = document.getElementById('slider');
const slides = 3;
function moveSlide(direction) {
    currentSlide = (currentSlide + direction + slides) % slides;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}
document.getElementById('next').addEventListener('click', () => moveSlide(1));
document.getElementById('prev').addEventListener('click', () => moveSlide(-1));
function startAutoSlider() { setInterval(() => moveSlide(1), 5000); }

// Product Fetching (API) 
async function fetchProducts() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();
        displayProducts(products);
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

function displayProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl shadow hover:shadow-2xl transition flex flex-col";
        card.innerHTML = `
            <img src="${product.image}" class="h-48 w-full object-contain mb-4">
            <h3 class="font-bold text-sm h-12 overflow-hidden">${product.title}</h3>
            <div class="flex justify-between items-center mt-auto pt-4">
                <span class="text-indigo-600 font-bold">${product.price} BDT</span>
                <span class="text-yellow-500 text-xs">⭐ ${product.rating.rate}</span>
            </div>
            <button onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "")}', ${product.price})" 
                class="mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                Add to Cart
            </button>
        `;
        container.appendChild(card);
    });
}

// Shopping Cart System 
function addToCart(id, title, price) {
    const totalWithNewItem = calculateTotal() + price;
    
    if (totalWithNewItem > balance) {
        const warning = document.getElementById('warning-msg');
        warning.classList.remove('hidden');
        setTimeout(() => warning.classList.add('hidden'), 3000);
        return;
    }

    cart.push({ id, title, price });
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = cart.length > 0 ? 50 : 0;
    const discount = document.getElementById('discount').innerText;
    return (subtotal + shipping) - parseFloat(discount);
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    cartList.innerHTML = '';
    
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center text-xs bg-gray-50 p-2 rounded";
        div.innerHTML = `
            <span class="truncate w-32">${item.title}</span>
            <span class="font-bold">${item.price} BDT</span>
            <button onclick="removeFromCart(${index})" class="text-red-500 font-bold">X</button>
        `;
        cartList.appendChild(div);
    });

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('shipping').innerText = cart.length > 0 ? 50 : 0;
    
    updateFinalTotal();
}

function updateFinalTotal() {
    const subtotal = parseFloat(document.getElementById('subtotal').innerText);
    const shipping = parseFloat(document.getElementById('shipping').innerText);
    const discount = parseFloat(document.getElementById('discount').innerText);
    const final = (subtotal + shipping - discount);
    document.getElementById('final-total').innerText = final > 0 ? final.toFixed(2) : 0;
}

// Coupon Logic
document.getElementById('apply-coupon').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value;
    const subtotal = parseFloat(document.getElementById('subtotal').innerText);
    if (code === "SMART10") {
        const discountVal = subtotal * 0.1;
        document.getElementById('discount').innerText = discountVal.toFixed(2);
        updateFinalTotal();
        alert("Coupon Applied! 10% Discount.");
    } else {
        alert("Invalid Coupon");
    }
});

//Review Carousel 
const reviews = [
    { name: "Anika", text: "Amazing quality products!", rating: 5 },
    { name: "Rahat", text: "Delivery was very fast. Highly recommended.", rating: 4 },
    { name: "Sami", text: "The balance system is so helpful to track spending.", rating: 5 }
];
let reviewIdx = 0;
function fetchReviews() {
    const container = document.getElementById('review-container');
    setInterval(() => {
        const r = reviews[reviewIdx];
        container.innerHTML = `
            <p class="text-xl">"${r.text}"</p>
            <h4 class="mt-4 font-bold text-indigo-600">- ${r.name}</h4>
            <div class="text-yellow-500">${"★".repeat(r.rating)}</div>
        `;
        reviewIdx = (reviewIdx + 1) % reviews.length;
    }, 4000);
}

//Footer & Scroll 
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});