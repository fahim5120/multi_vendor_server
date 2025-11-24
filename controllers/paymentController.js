const PaymentService = require("../services/PaymentService");
const UserService = require("../services/UserService");
const SellerService = require("../services/SellerService");
const OrderService = require("../services/OrderService");
const SellerReportService = require("../services/SellerReportService");
const TransactionService = require("../services/TransactionService");
const Cart = require("../Models/Cart");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ------------------------------------------------------
// 🔥 PAYMENT SUCCESS HANDLER (STRIPE ONLY)
// ------------------------------------------------------
const paymentSuccessHandler = async (req, res) => {
  const { orderId } = req.params;
  const { session_id } = req.query;

  try {
    // 1️⃣ JWT-ൽ നിന്നും user എടുക്കുന്നു
    const user = await req.user;

    // 2️⃣ Stripe സെഷൻ verify ചെയ്യുക
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // 3️⃣ PaymentOrder fetch ചെയ്യുക
    const paymentOrder = await PaymentService.getPaymentOrderById(orderId);

    // 4️⃣ Order-കൾ Paid ആക്കി update ചെയ്യുക
    await PaymentService.proceedPaymentOrder(paymentOrder);

    // ------------------------------------------------------
    // 🔥 Create Transaction + Update Seller Reports
    // ------------------------------------------------------
    for (let orderId of paymentOrder.orders) {
      const order = await OrderService.findOrderById(orderId);

      // ➤ Transaction ആഡ് ചെയ്യുക
      await TransactionService.createTransaction(order._id);

      // ➤ Seller, Report fetch ചെയ്യുക
      const seller = await SellerService.getSellerById(order.seller);
      const sellerReport = await SellerReportService.getSellerReport(seller);

      // ➤ Update seller report
      sellerReport.totalOrders += 1;
      sellerReport.totalEarnings += order.totalSellingPrice;
      sellerReport.totalSales += order.orderItems.length;

      await SellerReportService.updateSellerReport(sellerReport);
    }

    // ------------------------------------------------------
    // 🛒 Clear Cart After Successful Payment
    // ------------------------------------------------------
    await Cart.findOneAndUpdate(
      { user: user._id },
      { cartItems: [] },
      { new: true }
    );

    return res.status(200).json({
      message: "Payment successful",
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  paymentSuccessHandler,
};
