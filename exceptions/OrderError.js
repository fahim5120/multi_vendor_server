const AppError = require("./AppError");

// --------- FUNCTION-BASED CUSTOM ERROR ----------
const OrderError = (message) => {
  const error = AppError(message, 400); 
  error.name = "OrderError";
  return error;
};

module.exports = OrderError;
