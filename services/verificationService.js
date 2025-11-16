// file: services/verificationService.js
const VerificationCode = require("../models/VerificationCode");

exports.createVerificationCode = async (otp, email) => {
  const existing = await VerificationCode.findOne({ email });
  if (existing) {
    await VerificationCode.deleteOne({ _id: existing._id });
  }

  const vc = new VerificationCode({ otp, email });
  return await vc.save();
};

exports.getVerification = async (email) => {
  return await VerificationCode.findOne({ email });
};

exports.deleteVerification = async (id) => {
  return await VerificationCode.deleteOne({ _id: id });
};
