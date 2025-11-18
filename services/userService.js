const User = require("../models/User");


module.exports = {
  findUserByEmail: async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error(`User does not exist with email ${email}`);
    return user;
  },

  findUserProfileByEmail: async (email) => {
    const user = await User.findOne({ email }).populate("addresses");
    if (!user) throw new Error(`User does not exist with email ${email}`);
    return user;
  }
};
