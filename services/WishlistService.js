const Wishlist = require('../Models/Wishlist');

const WishlistService = {
    
    // Create a new wishlist
    createWishlist: async (user) => {
        try {
            const wishlist = new Wishlist({
                user: user._id,
                products: []
            });

            return await wishlist.save();
        } catch (error) {
            throw new Error(`Error creating wishlist: ${error.message}`);
        }
    },

    // Get wishlist by user ID
    getWishlistByUserId: async (user) => {
        try {
            let wishlist = await Wishlist.findOne({ user: user._id })
                .populate({ path: "products" });

            // If not exists → create new
            if (!wishlist) {
                wishlist = await WishlistService.createWishlist(user); // here
            }

            return wishlist;
        } catch (error) {
            throw new Error(`Error fetching wishlist: ${error.message}`);
        }
    },

    // Add or remove product
    addProductToWishlist: async (user, product) => {
        try {
            const wishlist = await WishlistService.getWishlistByUserId(user);

            const productIndex = wishlist.products.findIndex(
                (p) => p._id.toString() === product._id.toString()
            );

            if (productIndex > -1) {
                // remove
                wishlist.products.splice(productIndex, 1);
            } else {
                // add
                wishlist.products.push(product._id);
            }

            // Save Updated
            return await Wishlist.findByIdAndUpdate(wishlist._id, wishlist, { new: true })
                .populate({ path: "products" });

        } catch (error) {
            throw new Error(`Error updating wishlist: ${error.message}`);
        }
    }
};

module.exports = WishlistService;
