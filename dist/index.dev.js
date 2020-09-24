"use strict";

// After you done, separate product description as a separate component,
// which receives necessary data via a prop
Vue.component('product-item', {
  template: "\n        <li :class=\"{ disabledProduct : outOfStock }\">\n            <div class=\"product-image\" @mouseover=\"showVariants\" @mouseleave=\"hideVariants\">\n                <img :src=\"image\" class=\"img-responsive\" alt=\"product-image\">\n\n                <!-- Stock Indicator -->\n                <div class=\"product-stock\" v-if=\"selectedVariantQuantity > 5\">IN STOCK</div>\n                <div class=\"product-stock product-stock-alert\" v-else-if=\"selectedVariantQuantity <= 5 && selectedVariantQuantity > 0\">ONLY {{ selectedVariantQuantity }} LEFT</div>\n                <div class=\"product-stock product-stock-empty\" v-else>OUT OF STOCK</div>\n\n                \n                <!-- Like Button -->\n                <span :id=\"'heart-' + product.id\" class=\"fa fa-heart-o product-like\"></span>\n\n                <!-- Variants -->\n                <div v-show=\"variantsVisible\" class=\"product-variants-container\">\n                    <div class=\"product-variants\">\n                        <div \n                            v-for=\"(variant, index) in product.variants\" \n                            :key=\"variant.id\"\n                            @mouseover=\"updateProductImage(index)\"\n                            class=\"product-variant\"\n                        >\n                            <img :src=\"variant.avatar\" class=\"img-responsive\" alt=\"product-variant-image\">\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"product-description\">\n                <span class=\"pr-edition\">{{ title }}</span>\n                <h2 class=\"pr-name\">{{ product.name }}</h2>\n                <span class=\"pr-price\">{{ price }}&euro;</span>\n                <span class=\"pr-colors\">{{ product.colors }} Colors</span>\n\n                <div class=\"pr-review\" @click=\"showReviews\">\n                    <i class=\"fa fa-star\"></i> Reviews\n                </div>\n\n                <!-- Buy Button -->\n                <div class=\"pr-buy-button\" v-if=\"selectedVariantQuantity > 0\" @click=\"addToCart\">\n                    ADD TO CART\n                </div>\n\n                <div class=\"pr-reviews\" v-if=\"reviewsVisible\">\n                    <hr/>\n                    <product-review @review-submitted=\"addReview\"></product-review>\n                </div>\n            </div>\n\n        </li> \n    ",
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
      reviewsVisible: false,
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
      this.$emit('add-to-cart', this.selectedVariantId);
      this.product.variants[this.selectedVariant].quantity--;
    },
    updateProductImage: function updateProductImage(index) {
      this.selectedVariant = index;
    },
    showReviews: function showReviews() {
      this.reviewsVisible = !this.reviewsVisible;
    },
    addReview: function addReview(productReview) {
      this.product.reviews.push(productReview);
      console.log(this.product.reviews);
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
    },
    selectedVariantId: function selectedVariantId() {
      return this.product.variants[this.selectedVariant].id;
    }
  }
});
Vue.component('product-review', {
  template: "\n        <form @submit.prevent=\"submitReview\">\n            <h6>Review this product</h6>\n            <input type=\"text\" name=\"name\" v-model=\"name\" placeholder=\"Your name...\" required/>\n            <input type=\"text\" name=\"review\" v-model=\"review\" placeholder=\"Your opinion...\" required/>\n            <button class=\"pr-buy-button\" type=\"submit\">SUBMIT</button>\n        </form>\n    ",
  props: [],
  data: function data() {
    return {
      name: null,
      review: ""
    };
  },
  methods: {
    submitReview: function submitReview() {
      var productReview = {
        name: this.name,
        review: this.review
      };
      this.$emit('review-submitted', productReview);
      this.name = null;
      this.review = null;
    }
  }
});
var app = new Vue({
  el: "#app",
  data: {
    products: [],
    cart: {
      items: []
    }
  },
  methods: {
    updateCart: function updateCart(e) {
      this.cart.items.push(e);
      console.log(this.cart.items);
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