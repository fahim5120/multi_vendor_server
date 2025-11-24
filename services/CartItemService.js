const CartItem = require("../Models/CartItem");
const UserError = require("../exceptions/UserError");
const CartItemError = require("../exceptions/CartItemErrror");

// ------------------------------
// FIND CART ITEM BY ID
// ------------------------------
async function findCartItemById(cartItemId) {
  const cartItem = await CartItem.findById(cartItemId).populate("product");

  if (!cartItem) {
    throw new CartItemError(`Cart item not found with id: ${cartItemId}`);
  }

  return cartItem;
}

// ------------------------------
// UPDATE CART ITEM
// ------------------------------
async function updateCartItem(userId, id, cartItemData) {
  const cartItem = await findCartItemById(id);

  if (cartItem.userId.toString() !== userId.toString()) {
    throw new CartItemError("You can't update another user's cart item");
  }

  const updatedFields = {
    quantity: cartItemData.quantity,
    mrpPrice: cartItemData.quantity * cartItem.product.mrpPrice,
    sellingPrice: cartItemData.quantity * cartItem.product.sellingPrice,
  };

  return await CartItem.findByIdAndUpdate(id, updatedFields, {
    new: true,
  }).populate("product");
}

// ------------------------------
// REMOVE CART ITEM
// ------------------------------
async function removeCartItem(userId, cartItemId) {
  const cartItem = await findCartItemById(cartItemId);

  if (cartItem.userId.toString() !== userId.toString()) {
    throw new UserError("You can't remove another user's item");
  }

  await CartItem.deleteOne({ _id: cartItem._id });
}

module.exports = {
  updateCartItem,
  removeCartItem,
  findCartItemById,
};
