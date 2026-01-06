import jwt from 'jsonwebtoken';
import jwtConfig from '../config/config';
import User from '../models/User';

// Create JWT token for authenticated user
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  };

  // Token expires in 24hrs - best balance of security, does not need to implement refresh tokens
  // and blacklisting through database or memory. Later implementation would use refresh tokens
  // and blacklisting
  return jwt.sign(payload, jwtConfig.JWT_SECRET_KEY, {
    expiresIn: '24h',
  });
};

// middleware to verify JWT token on protected Routes
const verifyToken = async (request, response, next) => {
  // Get token from Authorization header, remove the Bearer prefix to get just the token

  const token = request.header(jwtConfig.TOKEN_HEADER_KEY)?.replace('Bearer ', '');

  // Check if token exists in the request headers
  if (!token) {
    return response.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    // Verify the token using our secret key
    // Should throw error if token is invalid, expired, or tampered with
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET_KEY);

    // Double check user exists in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return response.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    // Attach decoded user information to the request object
    // User data is made available to any subsequent middleware/route handlers
    request.user = decoded;
    return next();
  } catch {
    // Handle any token verification errors (invalid signature, expired token etc)
    return response.status(400).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

const requireAdmin = (request, response, next) => {
  if (!request.user.isAdmin) {
    return response.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  return next();
};

export { generateToken, verifyToken, requireAdmin };
