// After you done, separate product description as a separate component,
// which receives necessary data via a prop

var eventBus = new Vue()

// ------------------------------------------

// Product Item

// ------------------------------------------

Vue.component('product-item', {
    template: `
        <li :class="{ disabledProduct : outOfStock }">
            <div class="product-image" @mouseover="showVariants" @mouseleave="hideVariants">
                <img :src="image" class="img-responsive" alt="product-image">

                <!-- Stock Indicator -->
                <div class="product-stock" v-if="selectedVariantQuantity > 5">IN STOCK</div>
                <div class="product-stock product-stock-alert" v-else-if="selectedVariantQuantity <= 5 && selectedVariantQuantity > 0">ONLY {{ selectedVariantQuantity }} LEFT</div>
                <div class="product-stock product-stock-empty" v-else>OUT OF STOCK</div>

                
                <!-- Like Button -->
                <span :id="'heart-' + product.id" class="fa fa-heart-o product-like"></span>

                <!-- Variants -->
                <product-variants v-show="variantsVisible" :variants="product.variants" :id="product.id"></product-variants>
            </div>

            <product-description 
                :productdata="product" 
                :slctVariant="selectedVariant" 
                :slctQuantity="selectedVariantQuantity"
                :slctId="selectedVariantId"    
            ></product-description>
        </li> 
    `,
    props: ['productdata'],
    data() {
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
            selectedVariant: 0,
        }
    },
    methods: {
        showVariants() {
            this.variantsVisible = true;
        },
        hideVariants() {
            this.variantsVisible = false;
        }
    },
    computed: {
        outOfStock() {
            return this.totalQuantity === 0
        },
        image() {
            return this.product.variants[this.selectedVariant].avatar
        },
        totalQuantity() {
            return (this.productdata.variants).reduce((sum, variant) => {
                return sum + variant.quantity;
            }, 0)
        },
        selectedVariantQuantity() {
            return this.product.variants[this.selectedVariant].quantity
        },
        selectedVariantId() {
            return this.product.variants[this.selectedVariant].id
        }
    },
    mounted() { // Life Cycle Hook, gets called when component is mounted to the DOM
        eventBus.$on('review-submitted', _productReview => {
            this.product.reviews.push(_productReview)
        })
        eventBus.$on('selected-variant', _selectedVariant => {
            this.product.id === _selectedVariant[1] ? this.selectedVariant = _selectedVariant[0] : null
        })
        eventBus.$on('add-to-cart', _selectedId => {
            this.product.variants[this.selectedVariant].quantity--;
        })
    }
});

// ------------------------------------------

// Product Description

// ------------------------------------------

Vue.component('product-description', {
    props: ['productdata', 'slctVariant', 'slctQuantity', 'slctId'],
    template: `
    <div class="product-description">
        <span class="pr-edition">{{ title }}</span>
        <h2 class="pr-name">{{ productdata.name }}</h2>
        <span class="pr-price">{{ price }}&euro;</span>
        <span class="pr-colors">{{ productdata.colors }} Colors</span>

        <div class="pr-review" @click="toggleReviews">
            <i class="fa fa-star"></i> Reviews
        </div>

        <div class="pr-buy-button" v-if="slctQuantity > 0" @click="addToCart">
            ADD TO CART
        </div>

        <div class="pr-reviews" v-if="reviewsVisible">
            <hr/>
            <product-tabs :reviews="productdata.reviews"></product-tabs>
        </div>
    </div>
    `,
    data() {
        return {
            product: null,
            selectedVariant: 0,
            selectedVariantQuantity: 0,
            reviewsVisible: false
        }
    },
    methods: {
        toggleReviews() {
            this.reviewsVisible = !this.reviewsVisible
        },
        addToCart() {
            eventBus.$emit('add-to-cart', this.slctId);
        }
    },
    computed: {
        title() {
            return this.productdata.brand + ' ' + this.productdata.edition
        },
        price() {
            return this.productdata.variants[this.slctVariant].price
        }
    },
    mounted() {
        product = this.productdata
        selectedVariant = this.slctVariant
        selectedVariantQuantity = this.slctQuantity
    }
})

// ------------------------------------------

// Product Tabs

// ------------------------------------------

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
        <div class="tabs-container">
            <span
                class="tab"
                :class="{ activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs"
                :key="index"
                @click="selectedTab = tab"
            >{{ tab }}</span>
        </div>

        <product-review-list :reviews="reviews" v-show="selectedTab === 'Reviews'"></product-review-list>

        <product-review-form v-show="selectedTab === 'Make a Review'"></product-review-form>
    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

// ------------------------------------------

// Product Variants

// ------------------------------------------

Vue.component('product-variants', {
    props: ['variants', 'id'],
    template: `
    <div class="product-variants-container">
        <div class="product-variants">
            <div 
                v-for="(variant, index) in variants" 
                :key="index"
                @mouseover="selectVariant(index, id)"
                class="product-variant"
            >
                <img :src="variant.avatar" class="img-responsive" alt="product-variant-image">
            </div>
        </div>
    </div>
    `,
    data () {
        return {
            _selectedVariant: null
        }
    },
    methods: {
        selectVariant(index, id) {
            this._selectedVariant = [index, id];
            eventBus.$emit('selected-variant', this._selectedVariant);
            this._selectedVariant = null;
        },
    }
})

// ------------------------------------------

// Product Review

// ------------------------------------------

Vue.component('product-review-form', {
    template: `
        <form @submit.prevent="submitReview">
            <input type="text" name="name" v-model="name" placeholder="Your name..." required/>
            <input type="text" name="review" v-model="review" placeholder="Your opinion..." required/>
            <button class="pr-buy-button" type="submit">SUBMIT</button>
        </form>
    `,
    props: [],
    data () {
        return {
            name: null,
            review: "",
            date: null
        }
    },
    methods: {
        submitReview() {
            let productReview = {
                name: this.name,
                review: this.review,
                date: (new Date()).toLocaleDateString().split("/")
            }
            eventBus.$emit('review-submitted', productReview);
            this.name = null;
            this.review = null;
            this.date = null;
        }
    }
})

// ------------------------------------------

// Product Review List

// ------------------------------------------

Vue.component('product-review-list', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="reviews-gallery" v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <div v-else>
            <div class="review-item" v-for="(review, index) in reviews" :key="index">
                <span class="review-name">{{ review.name }}</span>
                <span class="review-date">
                {{ review.date[0] }}/{{ review.date[1] }}/{{ review.date[2] }}
                </span>
                <div class="clearfix"></div>
                <span class="review-content">{{ review.review }}</span>
            </div>
        </div>
    </div>
    `,
    data () {
        return {
            reviews: []
        }
    }
})

// ------------------------------------------

// App

// ------------------------------------------

const app = new Vue({
    el: "#app",
    data: {
        products: [],
        cart: {
            items: []
        }
    },
    created () {
        fetch("https://api.jsonbin.io/b/5f624b007243cd7e823d7bec/13", {
            method: 'GET',
            headers: {
                'secret-key': '$2b$10$RLi89aTLWEdIlq6r6Gzq1eKSjrRQi6JplO8trMu9KM.HT9s02tR/C'
            }
        }).then(res => res.json()).then(
            json => {
                this.products = json.products;
            }
        )
    },
    mounted () {
        eventBus.$on('add-to-cart', _selectedId => {
            this.cart.items.push(_selectedId);
            console.log(this.cart.items);
        })
    }
})

// ------------------------------------------