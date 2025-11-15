const jwt = require('jsonwebtoken')
const secretKey = "fjfhdghdfgjkfdhgjkhjkghghtrhthtyjjty"

class JwtProvider {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }


  // Method to create JWT
  createJwt(payload) {
    return jwt.sign(payload, this.secretKey, { expiresIn: '24h' });
  }
  getEmailFromJwt(token) {
    try {
      const decodedToken = jwt.verify(token, this.secretKey)
      return decodedToken.email
    } catch (error) {
      throw new Error("invalid token")
    }
  }

  // Method to verify JWT
  verifyJwt(token) {
    try {
      return jwt.verify(token, this.secretKey)
    } catch (error) {
      throw new Error("invalid token")

    }
  }
}

module.exports = new JwtProvider(secretKey);

