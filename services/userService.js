const User = require("../Models/User");


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

// const User = require('../Models/User');
// const jwtProvider = require('../utils/jwtProvider');
// const UserError = require('../exceptions/UserError');

// const UserService = {

//   findUserProfileByJwt: async (jwt) => {
//     const email = jwtProvider.getEmailFromJwt(jwt);
//     const user = await User.findOne({ email }).populate("addresses");

//     if (!user) {
//       throw new UserError(`User does not exist with email ${email}`);
//     }
//     return user;
//   },

//   findUserByEmail: async (email) => {
//     const user = await User.findOne({ email });

//     if (!user) {
//       throw new UserError(`User does not exist with email ${email}`);
//     }

//     return user;
//   },

// };


// module.exports = UserService;

