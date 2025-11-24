const CartService = require("../services/cartService");
const UserService = require("../services/UserService");
const ProductService = require("../services/productService");
const CartItemService = require("../services/CartItemService");

// -------------------------
// FIND USER CART
// -------------------------
const findUserCartHandler = async (req, res) => {
  try {
    const user = req.user;
    const cart = await CartService.findUserCart(user);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// -------------------------
// ADD ITEM TO CART
// -------------------------
const addItemToCart = async (req, res) => {
  try {
    const user = req.user;
    const product = await ProductService.findProductById(req.body.productId);

    const cartItem = await CartService.addCartItem(
      user,
      product,
      req.body.size,
      req.body.quantity
    );

    return res.status(202).json(cartItem);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// -------------------------
// DELETE CART ITEM
// -------------------------
const deleteCartItemHandler = async (req, res) => {
  try {
    const user = req.user;

    await CartItemService.removeCartItem(user._id, req.params.cartItemId);

    return res.status(202).json({ message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// -------------------------
// UPDATE CART ITEM
// -------------------------
const updateCartItemHandler = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = req.user;
    const cartItemId = req.params.cartItemId;

    let updated;

    if (quantity > 0) {
      updated = await CartItemService.updateCartItem(
        user._id,
        cartItemId,
        { quantity }
      );
    }

    return res.status(202).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// EXPORT functions
module.exports = {
  findUserCartHandler,
  addItemToCart,
  deleteCartItemHandler,
  updateCartItemHandler
};
