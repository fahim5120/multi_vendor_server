const mongoose=require("mongoose")
require('dotenv').config();
const mongoURI=process.env.MONGO_URI

const connectDB=async () => {
    try {
        
    const connect=await mongoose.connect(mongoURI)
        console.log("db connection successfull");
        console.log(`mongoDB connected ${connect.connection.name}`);
         console.log(`mongoDB connected ${connect.connection.host}`);
        
        
    } catch (error) {
        console.log(`MongoDB connection error: ${error.message}`)
         process.exit(1)
    }
}

module.exports=connectDB