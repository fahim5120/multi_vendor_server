const Transaction = require('../Models/Transaction');
const Seller = require('../Models/Seller');
const Order = require('../Models/Order');

// ------------------------------
// FUNCTION-BASED SERVICE OBJECT
// ------------------------------
const TransactionService = {

    // ------------------------------------------------
    // 🔥 CREATE TRANSACTION FROM ORDER
    // ------------------------------------------------
    createTransaction: async (orderId) => {
        const order = await Order.findById(orderId).populate('seller');
        if (!order) {
            throw new Error('Order not found');
        }

        const seller = await Seller.findById(order.seller._id);
        if (!seller) {
            throw new Error('Seller not found');
        }

        const transaction = new Transaction({
            seller: seller._id,
            customer: order.user,
            order: order._id
        });

        return await transaction.save();
    },

    // ------------------------------------------------
    // 🔥 GET ALL TRANSACTIONS OF A SELLER
    // ------------------------------------------------
    getTransactionsBySellerId: async (sellerId) => {
        return await Transaction.find({ seller: sellerId })
            .populate('order customer');
    },

    // ------------------------------------------------
    // 🔥 GET ALL TRANSACTIONS
    // ------------------------------------------------
    getAllTransactions: async () => {
        return await Transaction.find()
            .populate('seller order customer');
    }
};

module.exports = TransactionService;
