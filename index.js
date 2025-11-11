const express = require('express');
const connectDB = require('./config/db');

require('dotenv').config();
const app = express()


connectDB()
app.use(express.json());
app.get("/",(req,res)=>{
res.send("Welcome to backend of multi vendor Marketplace")
})




const PORT = process.env.PORT || 8000
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    
})