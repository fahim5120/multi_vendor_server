const mongoose = require("mongoose")
const Product = require("./Product")

const eventSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter event product name"] },
    description: { type: String, required: [true, "Please enter event product description"] },
    category: { type: String, required: [true, "Please enter your event category"] },
    start_Date: { type: Date, required: true },
    Finish_Date: { type: Date, required: true },
    status: { type: String, default: "Running" },
    tags: { type: String },
    originalPrice: { type: Number },
    discountPrice: { type: Number, required: [true, "Please enter event product price"] },
    stock: { type: Number, required: [true, "Please enter event product stock"] },
    image: [{ type: String }],
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            rating: { type: Number },
            comment: { type: String },
            ProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    ratings: { type: Number },
    shopId:{type:String,required:true},
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true, 
    },
    sold_out: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Event", eventSchema)