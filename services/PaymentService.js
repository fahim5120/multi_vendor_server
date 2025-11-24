require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PaymentOrder = require('../Models/PaymentOrder');
const Order = require('../Models/Order');

const PaymentStatus = require('../domain/PaymentStatus');
const PaymentOrderStatus = require('../domain/PaymentOrderStatus');
const OrderStatus = require('../domain/OrderStatus');

const PaymentService = {

    // --------------------------------------------------
    // 🟢 CREATE PAYMENT ORDER
    // --------------------------------------------------
    createOrder: async (user, orders) => {
        const amount = orders.reduce(
            (sum, order) => sum + order.totalSellingPrice,
            0
        );

        const paymentOrder = new PaymentOrder({
            amount,
            user: user._id,
            orders: orders.map(o => o._id)
        });

        return await paymentOrder.save();
    },

    // --------------------------------------------------
    // 🔍 FIND PAYMENT ORDER BY ID
    // --------------------------------------------------
    getPaymentOrderById: async (orderId) => {
        const paymentOrder = await PaymentOrder.findById(orderId);
        if (!paymentOrder) throw new Error("Payment order not found");
        return paymentOrder;
    },

    // --------------------------------------------------
    // 🔍 FIND PAYMENT ORDER USING Stripe Session ID
    // --------------------------------------------------
    getPaymentOrderByPaymentId: async (sessionId) => {
        const paymentOrder = await PaymentOrder.findOne({
            paymentLinkId: sessionId
        });

        if (!paymentOrder) throw new Error("Payment order not found");
        return paymentOrder;
    },

    // --------------------------------------------------
    // ⚡ MARK PAYMENT AS SUCCESS AFTER STRIPE VERIFY
    // --------------------------------------------------
    proceedPaymentOrder: async (paymentOrder) => {

        if (paymentOrder.status !== PaymentOrderStatus.PENDING)
            return false;

        // Update each order
        await Promise.all(paymentOrder.orders.map(async (orderId) => {
            const order = await Order.findById(orderId);
            order.paymentStatus = PaymentStatus.COMPLETED;
            order.orderStatus = OrderStatus.PLACED;
            await order.save();
        }));

        paymentOrder.status = PaymentOrderStatus.SUCCESS;
        await paymentOrder.save();
        return true;
    },

    // --------------------------------------------------
    // 💳 CREATE STRIPE PAYMENT LINK
    // --------------------------------------------------
    createStripePaymentLink: async (user, amount, paymentOrderId) => {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",

                success_url: `${process.env.CLIENT_URL}/payment-success/${paymentOrderId}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: { name: "byza Payment" },
                            unit_amount: amount * 100,
                        },
                        quantity: 1
                    }
                ]
            });

            // Save Stripe session ID inside DB
            await PaymentOrder.findByIdAndUpdate(paymentOrderId, {
                paymentLinkId: session.id
            });

            return session.url;

        } catch (err) {
            throw new Error(err.message);
        }
    },
};

module.exports = PaymentService;
