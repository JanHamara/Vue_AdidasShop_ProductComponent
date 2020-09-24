// After you done, separate product description as a separate component,
// which receives necessary data via a prop

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
                <div v-show="variantsVisible" class="product-variants-container">
                    <div class="product-variants">
                        <div 
                            v-for="(variant, index) in product.variants" 
                            :key="variant.id"
                            @mouseover="updateProductImage(index)"
                            class="product-variant"
                        >
                            <img :src="variant.avatar" class="img-responsive" alt="product-variant-image">
                        </div>
                    </div>
                </div>
            </div>

            <div class="product-description">
                <span class="pr-edition">{{ title }}</span>
                <h2 class="pr-name">{{ product.name }}</h2>
                <span class="pr-price">{{ price }}&euro;</span>
                <span class="pr-colors">{{ product.colors }} Colors</span>

                <div class="pr-review" @click="showReviews">
                    <i class="fa fa-star"></i> Reviews
                </div>

                <!-- Buy Button -->
                <div class="pr-buy-button" v-if="selectedVariantQuantity > 0" @click="addToCart">
                    ADD TO CART
                </div>

                <div class="pr-reviews" v-if="reviewsVisible">
                    <hr/>
                    <product-review @review-submitted="addReview"></product-review>
                </div>
            </div>

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
            reviewsVisible: false,
            selectedVariant: 0,
        }
    },
    methods: {
        showVariants() {
            this.variantsVisible = true;
        },
        hideVariants() {
            this.variantsVisible = false;
        },
        addToCart() {
            this.$emit('add-to-cart', this.selectedVariantId);
            this.product.variants[this.selectedVariant].quantity--;
        },
        updateProductImage(index) {
            this.selectedVariant = index;
        },
        showReviews() {
            this.reviewsVisible = !this.reviewsVisible
        },
        addReview(productReview) {
            this.product.reviews.push(productReview);
            console.log(this.product.reviews);
        }
    },
    computed: {
        outOfStock() {
            return this.totalQuantity === 0
        },
        image() {
            return this.product.variants[this.selectedVariant].avatar
        },
        title() {
            return this.product.brand + ' ' + this.product.edition
        },
        price() {
            return this.product.variants[this.selectedVariant].price
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
    }
});

Vue.component('product-review', {
    template: `
        <form @submit.prevent="submitReview">
            <h6>Review this product</h6>
            <input type="text" name="name" v-model="name" placeholder="Your name..." required/>
            <input type="text" name="review" v-model="review" placeholder="Your opinion..." required/>
            <button class="pr-buy-button" type="submit">SUBMIT</button>
        </form>
    `,
    props: [],
    data () {
        return {
            name: null,
            review: ""
        }
    },
    methods: {
        submitReview() {
            let productReview = {
                name: this.name,
                review: this.review
            }
            this.$emit('review-submitted', productReview);
            this.name = null;
            this.review = null;
        }
    }
})

const app = new Vue({
    el: "#app",
    data: {
        products: [],
        cart: {
            items: []
        }
    },
    methods: {
        updateCart(e) {
            this.cart.items.push(e);
            console.log(this.cart.items)
        },
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
    }
})