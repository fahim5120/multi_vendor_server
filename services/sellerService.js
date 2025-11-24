// const Address = require("../Models/Address");
// const Seller = require("../Models/Seller");
// const jwtProvider = require("../util/jwtProvider");

// class SellerService {

//     async createSeller(sellerData) {
//         const existingSeller = await Seller.findOne({ email: sellerData.email });
//         if (existingSeller) {
//             throw new Error("Email already registered")
//         }

//         let savedAddress = sellerData.pickupAddress
//         savedAddress = await Address.create(sellerData.pickupAddress)
//         const newSeller = new Seller({
//             sellerName: sellerData.name,
//             email: sellerData.email,
//             password: sellerData.password,
//             pickupAddress: savedAddress._id,
//             GSTIN: sellerData.GSTIN,
//             password: sellerData.password,
//             mobile: sellerData.mobile,
//             bankDetails: sellerData.bankDetails,
//             businessDetails: sellerData.businessDetails,


//         })
//         return await newSeller.save()
//     }

//     async getSellerProfile(jwt) {
//         const email = jwtProvider.getEmailFromJwt(jwt)
//         return this.getSellerByEmail(email)
//     }

//     async getSellerByEmail(email) {
//         const seller = await Seller.findOne({ email });
//         if (!seller) {
//             throw new Error("Seller not found")
//         }
//         return seller
//     }


// async getSellerById(id){
//     const seller = await Seller.findById(id);
//     if(!seller){
//         throw new SellerError("Seller not found")
//     }
//     return seller
// }

// async getAllSellers(status){
//     return await Seller.find({accountStatus:status})
// }

// async updateSeller(existingSeller, sellerData){
//     return await Seller.findByIdAndUpdate(existingSeller._id,sellerData,
//         {new:true}).populate('pickupAddress');
// }

// async updateSellerAccountStatus(sellerId,status){
//     const seller=await this.getSellerById(sellerId);
//     seller.accountStatus=status;
//     return await seller.save()
// }

// async updateSellerStatus(sellerId, status) {
//     return await Seller.findByIdAndUpdate(sellerId, 
//         {$set:{ accountStatus: status }},
//          { new: true });
// }

// async deleteSeller(sellerid){
// return await Seller.findByIdAndDelete(sellerid);
// }



// }

// module.exports= new SellerService()





// file: services/sellerService.js
const Seller = require("../Models/Seller");
const Address = require("../Models/Address");
const bcrypt = require("bcryptjs");
const UserRoles = require("../domain/UserRoles");

exports.createSeller = async (sellerData) => {
  const exists = await Seller.findOne({ email: sellerData.email });
  if (exists) throw new Error("Seller already exists with this email");

  let savedAddress = sellerData.pickupAddress;

  if (sellerData.pickupAddress && !sellerData.pickupAddress._id) {
    savedAddress = await Address.create(sellerData.pickupAddress);
  }

  const hashedPassword = await bcrypt.hash(sellerData.password, 10);

  const newSeller = await Seller.create({
    sellerName: sellerData.sellerName,
    mobile: sellerData.mobile,
    email: sellerData.email,
    password: hashedPassword,
    businessDetails: sellerData.businessDetails,
    bankDetails: sellerData.bankDetails,
    pickupAddress: savedAddress,
    GSTIN: sellerData.GSTIN,
    role: UserRoles.SELLER
  });

  return newSeller;
};

exports.getSellerByEmail = async (email) => {
  const seller = await Seller.findOne({ email }).populate("pickupAddress");
  if (!seller) throw new Error("Seller not found");
  return seller;
};

exports.getSellerById = async (id) => {
  const seller = await Seller.findById(id).populate("pickupAddress");
  if (!seller) throw new Error("Seller not found");
  return seller;
};

exports.getAllSellers = async (status) => {
  if (!status) return await Seller.find().populate("pickupAddress");
  return await Seller.find({ accountStatus: status }).populate("pickupAddress");
};

exports.updateSeller = async (existingSeller, updateData) => {
  const id = existingSeller._id ? existingSeller._id : existingSeller;

  const updated = await Seller.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("pickupAddress");

  if (!updated) throw new Error("Seller not found");
  return updated;
};

exports.deleteSeller = async (id) => {
  const exists = await Seller.exists({ _id: id });
  if (!exists) throw new Error("Seller not found with id " + id);

  return await Seller.deleteOne({ _id: id });
};

exports.verifyEmail = async (email) => {
  const seller = await Seller.findOne({ email });
  if (!seller) throw new Error("Seller not found");

  seller.isEmailVerified = true;
  return await seller.save();
};

exports.updateAccountStatus = async (id, status) => {
  const seller = await Seller.findById(id);
  if (!seller) throw new Error("Seller not found");

  seller.accountStatus = status;
  return await seller.save();
};
