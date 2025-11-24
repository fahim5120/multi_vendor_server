const ReviewService = require("../services/ReviewService");

const ReviewController = {
  
  // Create Review
  createReview: async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const user = await req.user;

      const review = await ReviewService.createReview(req.body, user, productId);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  // Get reviews by productId
  getReviewsByProductId: async (req, res, next) => {
    try {
      const reviews = await ReviewService.getReviewsByProductId(req.params.productId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  },

  // Update review
  updateReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { reviewText, rating } = req.body;

      const review = await ReviewService.updateReview(
        reviewId,
        reviewText,
        rating,
        req.user._id
      );

      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  // Delete review
  deleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;

      await ReviewService.deleteReview(reviewId, req.user._id);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ReviewController;
