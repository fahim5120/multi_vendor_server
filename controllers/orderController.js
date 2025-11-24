const OrderService = require("../services/OrderService");
const CartService = require("../services/cartService");
const UserService = require("../services/UserService");
const OrderError = require("../exceptions/OrderError");
const PaymentMethod = require("../domain/PaymentMethod");
const PaymentService = require("../services/PaymentService");
const PaymentOrder = require("../Models/PaymentOrder");

// ----------------------------------------------
// FUNCTION-BASED ORDER CONTROLLER (NO CLASS)
// ----------------------------------------------
const OrderController = {

  // ------------------------------------------------
  // 🔥 CREATE ORDER + CREATE PAYMENT ORDER
  // ------------------------------------------------
  createOrder: async (req, res) => {
    try {
      const { shippingAddress } = req.body;
      const { paymentMethod } = req.query;

      const user = await req.user;

      // User Cart
      const cart = await CartService.findUserCart(user);

      // Create orders for multiple sellers
      const orders = await OrderService.createOrder(user, shippingAddress, cart);

      // Create parent paymentOrder
      const paymentOrder = await PaymentService.createOrder(user, orders);

      let response = {};

      // STRIPE PAYMENT METHOD ONLY
      if (paymentMethod === PaymentMethod.STRIPE) {
        const paymentUrl = await PaymentService.createStripePaymentLink(
          user,
          paymentOrder.amount,
          paymentOrder._id
        );

        response.payment_link_url = paymentUrl;
      }

      return res.status(200).json(response);

    } catch (error) {
      return res.status(500).json({
        message: `Error creating order: ${error.message}`
      });
    }
  },


  // ------------------------------------------------
  // 🔍 GET ORDER BY ID
  // ------------------------------------------------
  getOrderById: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await OrderService.findOrderById(orderId);
      return res.status(200).json(order);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // 🔍 GET ORDER ITEM BY ID
  // ------------------------------------------------
  getOrderItemById: async (req, res) => {
    try {
      const { orderItemId } = req.params;
      const item = await OrderService.findOrderItemById(orderItemId);
      return res.status(200).json(item);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // 🧾 USER ORDER HISTORY
  // ------------------------------------------------
  getUserOrderHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const orders = await OrderService.usersOrderHistory(userId);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // 🏪 SELLER ORDERS
  // ------------------------------------------------
  getSellersOrders: async (req, res) => {
    try {
      const sellerId = req.seller._id;
      const orders = await OrderService.getShopsOrders(sellerId);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // 🔄 UPDATE ORDER STATUS
  // ------------------------------------------------
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId, orderStatus } = req.params;

      const updated = await OrderService.updateOrderStatus(orderId, orderStatus);
      return res.status(200).json(updated);

    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // ❌ CANCEL ORDER
  // ------------------------------------------------
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;

      const canceled = await OrderService.cancelOrder(orderId, userId);
      return res.status(200).json({
        message: "Order cancelled successfully",
        order: canceled,
      });

    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },


  // ------------------------------------------------
  // 🗑 DELETE ORDER
  // ------------------------------------------------
  deleteOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      await OrderService.deleteOrder(orderId);
      return res.status(200).json({ message: "Order deleted successfully" });

    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },

};

module.exports = OrderController;
