"use strict";

// After you done, separate product description as a separate component,
// which receives necessary data via a prop
var eventBus = new Vue(); // ------------------------------------------
// Product Item
// ------------------------------------------

Vue.component('product-item', {
  template: "\n        <li :class=\"{ disabledProduct : outOfStock }\">\n            <div class=\"product-image\" @mouseover=\"showVariants\" @mouseleave=\"hideVariants\">\n                <img :src=\"image\" class=\"img-responsive\" alt=\"product-image\">\n\n                <!-- Stock Indicator -->\n                <div class=\"product-stock\" v-if=\"selectedVariantQuantity > 5\">IN STOCK</div>\n                <div class=\"product-stock product-stock-alert\" v-else-if=\"selectedVariantQuantity <= 5 && selectedVariantQuantity > 0\">ONLY {{ selectedVariantQuantity }} LEFT</div>\n                <div class=\"product-stock product-stock-empty\" v-else>OUT OF STOCK</div>\n\n                \n                <!-- Like Button -->\n                <span :id=\"'heart-' + product.id\" class=\"fa fa-heart-o product-like\"></span>\n\n                <!-- Variants -->\n                <product-variants v-show=\"variantsVisible\" :variants=\"product.variants\" :id=\"product.id\"></product-variants>\n            </div>\n\n            <product-description \n                :productdata=\"product\" \n                :slctVariant=\"selectedVariant\" \n                :slctQuantity=\"selectedVariantQuantity\"\n                :slctId=\"selectedVariantId\"    \n            ></product-description>\n        </li> \n    ",
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
    }
  },
  computed: {
    outOfStock: function outOfStock() {
      return this.totalQuantity === 0;
    },
    image: function image() {
      return this.product.variants[this.selectedVariant].avatar;
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
  },
  mounted: function mounted() {
    var _this = this;

    // Life Cycle Hook, gets called when component is mounted to the DOM
    eventBus.$on('review-submitted', function (_productReview) {
      _this.product.reviews.push(_productReview);
    });
    eventBus.$on('selected-variant', function (_selectedVariant) {
      _this.product.id === _selectedVariant[1] ? _this.selectedVariant = _selectedVariant[0] : null;
    });
    eventBus.$on('add-to-cart', function (_selectedId) {
      _this.product.variants[_this.selectedVariant].quantity--;
    });
  }
}); // ------------------------------------------
// Product Description
// ------------------------------------------

Vue.component('product-description', {
  props: ['productdata', 'slctVariant', 'slctQuantity', 'slctId'],
  template: "\n    <div class=\"product-description\">\n        <span class=\"pr-edition\">{{ title }}</span>\n        <h2 class=\"pr-name\">{{ productdata.name }}</h2>\n        <span class=\"pr-price\">{{ price }}&euro;</span>\n        <span class=\"pr-colors\">{{ productdata.colors }} Colors</span>\n\n        <div class=\"pr-review\" @click=\"toggleReviews\">\n            <i class=\"fa fa-star\"></i> Reviews\n        </div>\n\n        <div class=\"pr-buy-button\" v-if=\"slctQuantity > 0\" @click=\"addToCart\">\n            ADD TO CART\n        </div>\n\n        <div class=\"pr-reviews\" v-if=\"reviewsVisible\">\n            <hr/>\n            <product-tabs :reviews=\"productdata.reviews\"></product-tabs>\n        </div>\n    </div>\n    ",
  data: function data() {
    return {
      product: null,
      selectedVariant: 0,
      selectedVariantQuantity: 0,
      reviewsVisible: false
    };
  },
  methods: {
    toggleReviews: function toggleReviews() {
      this.reviewsVisible = !this.reviewsVisible;
    },
    addToCart: function addToCart() {
      eventBus.$emit('add-to-cart', this.slctId);
    }
  },
  computed: {
    title: function title() {
      return this.productdata.brand + ' ' + this.productdata.edition;
    },
    price: function price() {
      return this.productdata.variants[this.slctVariant].price;
    }
  },
  mounted: function mounted() {
    product = this.productdata;
    selectedVariant = this.slctVariant;
    selectedVariantQuantity = this.slctQuantity;
  }
}); // ------------------------------------------
// Product Tabs
// ------------------------------------------

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: "\n    <div>\n        <div class=\"tabs-container\">\n            <span\n                class=\"tab\"\n                :class=\"{ activeTab: selectedTab === tab}\"\n                v-for=\"(tab, index) in tabs\"\n                :key=\"index\"\n                @click=\"selectedTab = tab\"\n            >{{ tab }}</span>\n        </div>\n\n        <product-review-list :reviews=\"reviews\" v-show=\"selectedTab === 'Reviews'\"></product-review-list>\n\n        <product-review-form v-show=\"selectedTab === 'Make a Review'\"></product-review-form>\n    </div>\n    ",
  data: function data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    };
  }
}); // ------------------------------------------
// Product Variants
// ------------------------------------------

Vue.component('product-variants', {
  props: ['variants', 'id'],
  template: "\n    <div class=\"product-variants-container\">\n        <div class=\"product-variants\">\n            <div \n                v-for=\"(variant, index) in variants\" \n                :key=\"index\"\n                @mouseover=\"selectVariant(index, id)\"\n                class=\"product-variant\"\n            >\n                <img :src=\"variant.avatar\" class=\"img-responsive\" alt=\"product-variant-image\">\n            </div>\n        </div>\n    </div>\n    ",
  data: function data() {
    return {
      _selectedVariant: null
    };
  },
  methods: {
    selectVariant: function selectVariant(index, id) {
      this._selectedVariant = [index, id];
      eventBus.$emit('selected-variant', this._selectedVariant);
      this._selectedVariant = null;
    }
  }
}); // ------------------------------------------
// Product Review
// ------------------------------------------

Vue.component('product-review-form', {
  template: "\n        <form @submit.prevent=\"submitReview\">\n            <input type=\"text\" name=\"name\" v-model=\"name\" placeholder=\"Your name...\" required/>\n            <input type=\"text\" name=\"review\" v-model=\"review\" placeholder=\"Your opinion...\" required/>\n            <button class=\"pr-buy-button\" type=\"submit\">SUBMIT</button>\n        </form>\n    ",
  props: [],
  data: function data() {
    return {
      name: null,
      review: "",
      date: null
    };
  },
  methods: {
    submitReview: function submitReview() {
      var productReview = {
        name: this.name,
        review: this.review,
        date: new Date().toLocaleDateString().split("/")
      };
      eventBus.$emit('review-submitted', productReview);
      this.name = null;
      this.review = null;
      this.date = null;
    }
  }
}); // ------------------------------------------
// Product Review List
// ------------------------------------------

Vue.component('product-review-list', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: "\n    <div class=\"reviews-gallery\" v-show=\"selectedTab === 'Reviews'\">\n        <p v-if=\"!reviews.length\">There are no reviews yet.</p>\n        <div v-else>\n            <div class=\"review-item\" v-for=\"(review, index) in reviews\" :key=\"index\">\n                <span class=\"review-name\">{{ review.name }}</span>\n                <span class=\"review-date\">\n                {{ review.date[0] }}/{{ review.date[1] }}/{{ review.date[2] }}\n                </span>\n                <div class=\"clearfix\"></div>\n                <span class=\"review-content\">{{ review.review }}</span>\n            </div>\n        </div>\n    </div>\n    ",
  data: function data() {
    return {
      reviews: []
    };
  }
}); // ------------------------------------------
// App
// ------------------------------------------

var app = new Vue({
  el: "#app",
  data: {
    products: [],
    cart: {
      items: []
    }
  },
  created: function created() {
    var _this2 = this;

    fetch("https://api.jsonbin.io/b/5f624b007243cd7e823d7bec/13", {
      method: 'GET',
      headers: {
        'secret-key': '$2b$10$RLi89aTLWEdIlq6r6Gzq1eKSjrRQi6JplO8trMu9KM.HT9s02tR/C'
      }
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      _this2.products = json.products;
    });
  },
  mounted: function mounted() {
    var _this3 = this;

    eventBus.$on('add-to-cart', function (_selectedId) {
      _this3.cart.items.push(_selectedId);

      console.log(_this3.cart.items);
    });
  }
}); // ------------------------------------------