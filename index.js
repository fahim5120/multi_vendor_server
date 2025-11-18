const express = require('express');
const connectDB = require('./config/db');
const apiroutes = require('./Routes/indexRoutes');
const AdminService = require('./services/adminService');

require('dotenv').config();
const app = express()

AdminService.createDefaultAdmin();
connectDB()
app.use(express.json());
app.get("/",(req,res)=>{
res.send({message:"Hello Welcome to buyza backend system"})
})


app.use("/api",apiroutes)

const PORT = process.env.PORT || 8000
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    
})