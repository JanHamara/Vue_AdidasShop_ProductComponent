"use strict";

Vue.component('product-item', {
  template: "\n        <li :class=\"{ disabledProduct : outOfStock }\">\n            <div class=\"product-image\" @mouseover=\"showVariants\" @mouseleave=\"hideVariants\">\n                <img :src=\"image\" class=\"img-responsive\" alt=\"product-image\">\n\n                <!-- Stock Indicator -->\n                <div class=\"product-stock\" v-if=\"selectedVariantQuantity > 5\">IN STOCK</div>\n                <div class=\"product-stock product-stock-alert\" v-else-if=\"selectedVariantQuantity <= 5 && selectedVariantQuantity > 0\">ONLY {{ selectedVariantQuantity }} LEFT</div>\n                <div class=\"product-stock product-stock-empty\" v-else>OUT OF STOCK</div>\n\n                \n                <!-- Like Button -->\n                <span :id=\"'heart-' + product.id\" class=\"fa fa-heart-o product-like\"></span>\n\n                <!-- Variants -->\n                <div v-show=\"variantsVisible\" class=\"product-variants-container\">\n                    <div class=\"product-variants\">\n                        <div \n                            v-for=\"(variant, index) in product.variants\" \n                            :key=\"variant.id\"\n                            @mouseover=\"updateProductImage(index)\"\n                            class=\"product-variant\"\n                        >\n                            <img :src=\"variant.avatar\" class=\"img-responsive\" alt=\"product-variant-image\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"product-description\">\n                <span class=\"pr-edition\">{{ title }}</span>\n                <h2 class=\"pr-name\">{{ product.name }}</h2>\n                <span class=\"pr-price\">{{ price }}&euro;</span>\n                <span class=\"pr-colors\">{{ product.colors }} Colors</span>\n\n                <!-- Buy Button -->\n                <div class=\"pr-buy-button\" v-if=\"selectedVariantQuantity > 0\" @click=\"addToCart()\">\n                    ADD TO CART\n                </div>\n            </div>\n        </li> \n    ",
  props: ['productdata'],
  data: function data() {
    return {
      product: {
        id: this.productdata.id,
        brand: this.productdata.brand,
        name: this.productdata.name,
        edition: this.productdata.edition,
        desc: this.productdata.desc,
        colors: this.productdata.colors,
        like: this.productdata.like,
        avatar: this.productdata.avatar,
        alttext: this.productdata.alttext,
        category: this.productdata.category,
        reviews: this.productdata.reviews,
        variants: this.productdata.variants
      },
      variantsVisible: false,
      selectedVariant: 0
    };
  },
  methods: {
    showVariants: function showVariants() {
      this.variantsVisible = true;
    },
    hideVariants: function hideVariants() {
      this.variantsVisible = false;
    },
    addToCart: function addToCart() {
      // this.cart.quantity++;
      // this.cart.items.push(this.product.variants[this.selectedVariant].id);
      this.product.variants[this.selectedVariant].quantity--;
      console.log("Total Quantity:", this.totalQuantity); // console.log("Cart:", this.cart)
    },
    updateProductImage: function updateProductImage(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    outOfStock: function outOfStock() {
      return this.totalQuantity === 0;
    },
    image: function image() {
      return this.product.variants[this.selectedVariant].avatar;
    },
    title: function title() {
      return this.product.brand + ' ' + this.product.edition;
    },
    price: function price() {
      return this.product.variants[this.selectedVariant].price;
    },
    totalQuantity: function totalQuantity() {
      return this.productdata.variants.reduce(function (sum, variant) {
        return sum + variant.quantity;
      }, 0);
    },
    selectedVariantQuantity: function selectedVariantQuantity() {
      return this.product.variants[this.selectedVariant].quantity;
    }
  }
});
var app = new Vue({
  el: "#app",
  data: {
    products: [],
    cart: {
      quantity: 0,
      items: []
    }
  },
  created: function created() {
    var _this = this;

    fetch("https://api.jsonbin.io/b/5f624b007243cd7e823d7bec/13", {
      method: 'GET',
      headers: {
        'secret-key': '$2b$10$RLi89aTLWEdIlq6r6Gzq1eKSjrRQi6JplO8trMu9KM.HT9s02tR/C'
      }
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      _this.products = json.products;
    });
  }
});