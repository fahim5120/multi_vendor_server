const OrderStatus = require("../domain/OrderStatus");
const SellerReport = require("../Models/SellerReport");
const OrderService = require("./OrderService");

// ----------------------------------------
// FUNCTION-BASED SERVICE OBJECT VERSION
// ----------------------------------------
const SellerReportService = {

  // ----------------------------------------------------
  // 🔥 GET SELLER REPORT / CREATE NEW REPORT
  // ----------------------------------------------------
  getSellerReport: async (seller) => {
    try {
      let sellerReport = await SellerReport.findOne({ seller: seller._id });

      const orders = await OrderService.getShopsOrders(seller._id);

      const totalEarnings = orders.reduce(
        (total, order) => total + order.totalSellingPrice,
        0
      );

      const canceledOrders = orders.filter(
        (order) => order.orderStatus === OrderStatus.CANCELLED
      );

      const totalRefunds = canceledOrders.reduce(
        (total, order) => total + order.totalSellingPrice,
        0
      );

      sellerReport = new SellerReport({
        seller: seller._id,
        totalOrders: orders.length,
        totalEarnings,
        totalSales: orders.length,
        canceledOrders: canceledOrders.length,
        totalRefunds
      });

      return await sellerReport.save();

    } catch (err) {
      throw new Error(`Error fetching seller report: ${err.message}`);
    }
  },

  // ----------------------------------------------------
  // 🔥 UPDATE SELLER REPORT
  // ----------------------------------------------------
  updateSellerReport: async (sellerReport) => {
    try {
      return await SellerReport.findByIdAndUpdate(
        sellerReport._id,
        sellerReport,
        { new: true }
      );
    } catch (err) {
      throw new Error(`Error updating seller report: ${err.message}`);
    }
  }
};

module.exports = SellerReportService;
