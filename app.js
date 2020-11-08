// variables

const cartButton = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];
// buttons
let buttonsDOM = []


// getting the product
class Products{
    async getProducts(){
        try {
            let result = await fetch('products.json')
            let data = await result.json();
            let products = data.items;
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        } catch  (error) {
            console.log(error)
        }

    }
}

// display products 
class UI {
    displayProducts(products){
        // console.log(products)
        let result = ''
        products.forEach(product => {
            result += `
                <!-- single product -->
                    <article class="product">
                        <div class="img-container">
                            <img class="product-img" src="${product.image}">
                            <button class="bag-btn" data-id="${product.id}">
                                <i class="fa-shopping-cart"></i>
                                add to bag
                            </button>  
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>
                    <!-- end of single product -->
        `;
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons(){
        buttonsDOM = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = 'In Cart';
                button.disabled = true;
            } else {
                button.addEventListener('click', event => {
                    event.target.innerText = "in Cart"
                    event.target.disabled = true;
                    // get product from products 
                    let cartItem = {...Storage.getProduct(id), amount: 1};
                    // add product to the cart
                     cart.push(cartItem);
                     // save cart to the local storage
                     Storage.saveCart(cart);
                     // set cart values
                     this.setCartValues(cart)
                     // display cart 
                    this.addCartItem(cartItem) 
                    
                });
            }
        });
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        // console.log(item)
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <!-- cart item -->
        <img src="${item.image}" alt="product">./images/product-1.jpeg
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        <!-- end of cart item -->
        `;
        cartContent.appendChild(div);
    }

    showCart(){
        cartButton.addEventListener('click', () => {
        cartOverlay.style.visibility = 'visible'
        cartDOM.style.transform = 'none'
        });
       
    }

    closeCart(){
        closeCartBtn.addEventListener('click', () => {
        cartOverlay.style.visibility = 'hidden'
        cartDOM.style.transform = 'translateX(100%)'
        });
    }

    setupAPP(){
        // localStorage.setItem('cart', JSON.stringify([{"title":"king panel bed","price":12.99,"id":"2","image":"./images/product-2.jpeg","amount":1}]));
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
    }

    populateCart(cart){
        cart.forEach(element => this.addCartItem(element))
    }

    cartLogic(){
        clearCartBtn.addEventListener(('click'), () => {
            this.clearCart()
        });

        cartContent.addEventListener(('click'), event => {
            let eventTarget = event.target
            if (eventTarget.classList.contains('remove-item')){
                this.removeItem(eventTarget.dataset.id)
                eventTarget.parentElement.parentElement.innerHTML = ''
            } else if (eventTarget.classList.contains('fa-chevron-up')){
                let elem = cart.find(item => item.id === eventTarget.dataset.id)
                elem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                eventTarget.nextElementSibling.innerText = elem.amount;         
            } else if (eventTarget.classList.contains('fa-chevron-down')){
                let elem = cart.find(item => item.id === eventTarget.dataset.id)
                if(elem.amount !== 0){
                    elem.amount -= 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    eventTarget.previousElementSibling.innerText = elem.amount; 
                } 
            }
        });
    }

    clearCart(){
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        cartContent.innerHTML = ''
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.singleButton(id);
        button.disabled = false
        button.innerHTML = "<i class='fas fa-shopping-cart'></i> add to cart"
    }

    singleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }

}

// local storage 
class Storage{
    static saveProducts(product){
        localStorage.setItem("products", JSON.stringify(product));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        // console.log(products)
        return products.find(product => product.id === id)
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // show cart
    ui.showCart()

    // close cart
    ui.closeCart()

    //setup app
    ui.setupAPP()

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        // console.log(products)
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });

    
});