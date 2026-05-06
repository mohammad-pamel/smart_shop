// Initialize balance from localStorage
let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 1000;
let cart = [];
let currentSlide = 0;
let allProducts = [];

//Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateBalanceUI();
    fetchProducts();
    fetchReviews();
    startAutoSlider();
    setupMobileMenu();
});

//Navbar & Balance Logic
function updateBalanceUI() {
    document.getElementById('balance-amount').innerText = balance;
    localStorage.setItem('balance', balance);
}

document.getElementById('add-money').addEventListener('click', () => {
    balance += 1000;
    updateBalanceUI();
});

function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = menuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = menuBtn.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            });
        });
    }
}

//Sliding Banner
const slider = document.getElementById('slider');
const totalSlides = 3; 

function moveSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.getElementById('next').addEventListener('click', () => moveSlide(1));
document.getElementById('prev').addEventListener('click', () => moveSlide(-1));
function startAutoSlider() { setInterval(() => moveSlide(1), 5000); }

//Product Management (API + Search)
async function fetchProducts() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) {
        console.error("Error fetching products:", err);
        document.getElementById('product-container').innerHTML = "<p>Failed to load products.</p>";
    }
}

function displayProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10">No products found.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl shadow hover:shadow-2xl transition flex flex-col border border-gray-100";
        // Clean title for JS function call
        const safeTitle = product.title.replace(/'/g, "\\'");
        
        card.innerHTML = `
            <div class="h-48 w-full mb-4 flex items-center justify-center overflow-hidden">
                <img src="${product.image}" class="max-h-full object-contain hover:scale-110 transition duration-300">
            </div>
            <h3 class="font-bold text-sm h-12 overflow-hidden text-gray-800">${product.title}</h3>
            <div class="flex justify-between items-center mt-auto pt-4">
                <span class="text-indigo-600 font-bold">${product.price.toFixed(2)} BDT</span>
                <span class="text-yellow-500 text-xs font-semibold">⭐ ${product.rating.rate}</span>
            </div>
            <button onclick="addToCart(${product.id}, '${safeTitle}', ${product.price})" 
                class="mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
                Add to Cart
            </button>
        `;
        container.appendChild(card);
    });
}

//Shopping Cart System
function addToCart(id, title, price) {
    const currentTotal = calculateTotal();
    
    if (currentTotal + price > balance) {
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
    const discount = parseFloat(document.getElementById('discount').innerText) || 0;
    return (subtotal + shipping) - discount;
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="text-gray-400 text-sm italic py-4">Your cart is empty</p>';
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center text-xs bg-gray-50 p-3 rounded-lg border border-gray-100";
        div.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold text-gray-700 truncate w-32">${item.title}</span>
                <span class="text-indigo-600">${item.price} BDT</span>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 p-1">
                <i class="fa-solid fa-trash-can"></i>
            </button>
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

//Coupon Logic
document.getElementById('apply-coupon').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim();
    const subtotal = parseFloat(document.getElementById('subtotal').innerText);
    
    if (subtotal === 0) {
        alert("Add items to cart first!");
        return;
    }

    if (code === "SMART10") {
        const discountVal = subtotal * 0.1;
        document.getElementById('discount').innerText = discountVal.toFixed(2);
        updateFinalTotal();
        alert("Coupon Applied! 10% Discount.");
    } else {
        alert("Invalid Coupon Code");
    }
});

//Review Carousel
const reviews = [
    { name: "Pamel", text: "Quality is top-notch! Best shop in town.", rating: 5 },
    { name: "Ashraf", text: "Fast delivery and great support.", rating: 4 },
    { name: "Anik", text: "The website is very user-friendly.", rating: 5 },
    { name: "Rahat", text: "Loved the summer collection items.", rating: 4 },
    { name: "Sami", text: "I can track my balance easily while shopping.", rating: 5 }
];
let reviewIdx = 0;
function fetchReviews() {
    const container = document.getElementById('review-container');
    const updateReview = () => {
        const r = reviews[reviewIdx];
        container.classList.add('opacity-0'); 
        setTimeout(() => {
            container.innerHTML = `
                <i class="fa-solid fa-quote-left text-3xl mb-4 text-indigo-400 opacity-50"></i>
                <p class="text-lg md:text-xl font-medium mb-4">"${r.text}"</p>
                <h4 class="font-bold text-indigo-400">- ${r.name}</h4>
                <div class="text-yellow-400 mt-2">${"★".repeat(r.rating)}</div>
            `;
            container.classList.remove('opacity-0');
        }, 300);
        reviewIdx = (reviewIdx + 1) % reviews.length;
    };
    updateReview();
    setInterval(updateReview, 5000);
}

//Additional Feature: Search Logic
const searchInput = document.createElement('input');
searchInput.id = "search-input";
searchInput.placeholder = "Search products...";
searchInput.className = "w-1/2 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none";
document.querySelector('#products h2').after(searchInput);

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
    );
    displayProducts(filtered);
});

// Contact
const sendMessage = document.getElementById('send').addEventListener('click', () => {
    // e.preventDefault();
    const message = document.getElementById('message').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if(message !== '' && name !== '' && email !== '')
    {
        alert('Thanks')
    }
}    
)
//Footer & Scroll 
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});