const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Address = require("../Models/Address");
const User = require("../Models/User");
const OrderItem = require("../Models/OrderItem");

const CartService = require("./cartService");
const OrderError = require("../exceptions/OrderError");
const OrderStatus = require("../domain/OrderStatus");
const PaymentStatus = require("../domain/PaymentStatus");

const mongoose = require("mongoose");
const TransactionService = require("./TransactionService");

// -----------------------------
//   SERVICE OBJECT VERSION
// -----------------------------
const OrderService = {

  // ---------------------------------------------------------
  // 🔥 CREATE ORDER (ARROW FUNCTION)
  // ---------------------------------------------------------
  createOrder: async (user, shippingAddress, cart) => {
    try {
      if (shippingAddress._id && !user.addresses.includes(shippingAddress._id)) {
        user.addresses.push(shippingAddress._id);
        await User.findByIdAndUpdate(user._id, user);
      }

      if (!shippingAddress._id) {
        shippingAddress = await Address.create(shippingAddress);
        user.addresses.push(shippingAddress._id);
        await User.findByIdAndUpdate(user._id, user);
      }

      const itemsBySeller = cart.cartItems.reduce((acc, item) => {
        const sellerId = item.product.seller._id.toString();
        acc[sellerId] = acc[sellerId] || [];
        acc[sellerId].push(item);
        return acc;
      }, {});

      const orders = new Set();

      for (const [sellerId, cartItems] of Object.entries(itemsBySeller)) {
        const totalOrderPrice = cartItems.reduce(
          (sum, item) => sum + item.sellingPrice,
          0
        );

        const totalItemCount = cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const newOrder = new Order({
          user: user._id,
          seller: sellerId,
          totalMrpPrice: totalOrderPrice,
          totalSellingPrice: totalOrderPrice,
          totalItem: totalItemCount,
          shippingAddress: shippingAddress._id,
          orderStatus: OrderStatus.PENDING,
          paymentDetails: { status: PaymentStatus.PENDING },
          orderItems: [],
        });

        const orderItems = await Promise.all(
          cartItems.map(async (cartItem) => {
            const orderItem = new OrderItem({
              mrpPrice: cartItem.mrpPrice,
              product: cartItem.product._id,
              quantity: cartItem.quantity,
              size: cartItem.size,
              userId: cartItem.userId,
              sellingPrice: cartItem.sellingPrice,
            });

            const savedOrderItem = await orderItem.save();
            newOrder.orderItems.push(savedOrderItem._id);
            return savedOrderItem;
          })
        );

        const savedOrder = await newOrder.save();
        TransactionService.createTransaction(savedOrder._id);

        orders.add(savedOrder);
      }

      return Array.from(orders);

    } catch (error) {
      console.log("Order error", error);
      throw new Error(error.message);
    }
  },

  // ---------------------------------------------------------
  // 🔥 FIND ORDER BY ID
  // ---------------------------------------------------------
  findOrderById: async (orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderError("Invalid Order ID...");
    }

    const order = await Order.findById(orderId).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);

    if (!order) {
      throw new OrderError(`Order not found with id ${orderId}`);
    }

    return order;
  },

  // ---------------------------------------------------------
  // 🔥 FIND ORDER ITEM BY ID
  // ---------------------------------------------------------
  findOrderItemById: async (orderItemId) => {
    if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
      throw new OrderError("Invalid Order Item ID...");
    }

    const orderItem = await OrderItem.findById(orderItemId).populate([
      { path: "product", populate: { path: "seller" } },
    ]);

    if (!orderItem) {
      throw new OrderError(`Order item not found`);
    }

    return orderItem;
  },

  // ---------------------------------------------------------
  // 🔥 ORDER HISTORY
  // ---------------------------------------------------------
  usersOrderHistory: async (userId) => {
    return await Order.find({ user: userId }).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);
  },

  // ---------------------------------------------------------
  // 🔥 SELLER ORDER LIST
  // ---------------------------------------------------------
  getShopsOrders: async (sellerId) => {
    return await Order.find({ seller: sellerId })
      .sort({ orderDate: -1 })
      .populate([
        { path: "seller" },
        { path: "shippingAddress" },
        { path: "orderItems", populate: { path: "product" } },
      ]);
  },

  // ---------------------------------------------------------
  // 🔥 UPDATE ORDER STATUS
  // ---------------------------------------------------------
  updateOrderStatus: async (orderId, orderStatus) => {
    const order = await OrderService.findOrderById(orderId);

    order.orderStatus = orderStatus;

    return await Order.findByIdAndUpdate(orderId, order, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "seller" },
      { path: "shippingAddress" },
      { path: "orderItems", populate: { path: "product" } },
    ]);
  },

  // ---------------------------------------------------------
  // 🔥 DELETE ORDER
  // ---------------------------------------------------------
  deleteOrder: async (orderId) => {
    const order = await OrderService.findOrderById(orderId);
    if (!order) {
      throw new OrderError(`Order not found with id ${orderId}`);
    }
    return await Order.deleteOne({ _id: orderId });
  },

  // ---------------------------------------------------------
  // 🔥 CANCEL ORDER
  // ---------------------------------------------------------
  cancelOrder: async (orderId, user) => {
    const order = await OrderService.findOrderById(orderId);

    if (user._id.toString() !== order.user.toString()) {
      throw new OrderError(`You can't cancel this order`);
    }

    order.orderStatus = OrderStatus.CANCELLED;

    return await Order.findByIdAndUpdate(orderId, order, { new: true });
  }
};

module.exports = OrderService;
