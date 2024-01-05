const client = contentful.createClient({
  space: '2e20a9hw02zk',
  accessToken: '-t2pqwwXtoaSEGAKDytBT5U5svWew6AM-0mQjhzrSec',
});


//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDom = document.querySelector('.products-center');
// cart
let cart = [];
//buttons
let buttonsDOM =[]

// getting the products
class Products {  
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "comfyHouse"
      });
      
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      console.log(contentful.items);
      console.log(products);
      products = products.map(item => {
        const {title, price} = item.fields;
        /*
        const title = item.fields.title;
        const price = item.fields.price; */
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, id, image};
      })
      return products;
    } catch(error) {
      console.log("Catch error: ", error)
    }
    
  }
}


// display products
class UI {
  displayProducts(products) { 
    let result = '';
    products.forEach(product => {
      result += `
      <!-- Single Product -->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="product" class="product-img">
          <button class="bag-btn" data-id="${product.id}">
            <i class="fas-fashopping-cart">
              add to cart
            </i>
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- Single Product End-->
      `
    });
    productDom.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart) {
        button.innerText = "in Cart";
        button.disabled = true;
      } 
      button.addEventListener('click', (event)=> {
        event.target.innerText = "in Cart";
        event.target.disabled;
        // get product from products;
        let cartItem = {...Storage.getProduct(id), amount:1};
        // add product to the cart
        cart = [...cart, cartItem];
        // save  cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      })
      }
    )
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = tempTotal.toFixed(2);
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = 
     `
      <img src="${item.image}" alt="product">
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
      `
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDom.classList.add('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart)
  }
  populateCart(cart) {
    cart.forEach(item =>this.addCartItem(item));
  } 
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDom.classList.remove('showCart');
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener('click', ()=> {
      this.clearCart();
    })
    // cart functionality
    cartContent.addEventListener('click', (event)=> {
      console.log(event.target.classList[1]);
      if(event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if(event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id===id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if(event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id===id);
        if (tempItem.amount > 1) {
          tempItem.amount -= 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    })
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();

  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = 
      `<i class="fas-fashopping-cart">
        add to bag
      </i>` 
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

//Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
  }
}

document.addEventListener('DOMContentLoaded', 
  ()=> {
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    // get all products
    products.getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products)
    })
    .then(()=> {
      ui.getBagButtons();
      ui.cartLogic();
    });
  }
)
