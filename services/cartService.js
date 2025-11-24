// services/cartService.js
const CartItem = require("../Models/CartItem");
const Cart = require("../Models/Cart");

// % Calculate Discount
const calculateDiscountPercentage = (mrpPrice, sellingPrice) => {
  if (mrpPrice <= 0) return 0;
  return Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100);
};

// 🛒 Find User Cart
const findUserCart = async (user) => {
  let cart = await Cart.findOne({ user: user._id }).populate({
    path: "cartItems",
    populate: { path: "product" },
  });

  // If no cart found → create new
  if (!cart) {
    cart = await Cart.create({ user: user._id, cartItems: [] });
  }

  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  let totalItem = 0;

  cart.cartItems.forEach((item) => {
    totalPrice += item.mrpPrice;
    totalDiscountedPrice += item.sellingPrice;
    totalItem += item.quantity;
  });

  cart.totalMrpPrice = totalPrice;
  cart.totalSellingPrice = totalDiscountedPrice - (cart.couponPrice || 0);
  cart.discount = calculateDiscountPercentage(totalPrice, totalDiscountedPrice);
  cart.totalItem = totalItem;

  const cartItems = await CartItem.find({ cart: cart._id }).populate("product");
  cart.cartItems = cartItems;

  return cart;
};

// ➕ Add Item To Cart
const addCartItem = async (user, product, size, quantity) => {
  const cart = await findUserCart(user);

  let present = await CartItem.findOne({
    cart: cart._id,
    product: product._id,
    size,
  }).populate("product");

  if (!present) {
    const cartItem = await CartItem.create({
      product,
      quantity,
      userId: user._id,
      sellingPrice: quantity * product.sellingPrice,
      mrpPrice: quantity * product.mrpPrice,
      size,
      cart: cart._id,
    });

    await Cart.findByIdAndUpdate(
      cart._id,
      { $push: { cartItems: cartItem._id } },
      { new: true }
    );

    return cartItem;
  }

  return present;
};

module.exports = {
  findUserCart,
  addCartItem,
  calculateDiscountPercentage,
};
