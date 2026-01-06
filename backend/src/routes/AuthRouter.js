// Routes for login, registration, logout
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { validateUserRegistration, validateLogin } from '../utils/validation';
import User from '../models/User';
import { generateToken } from '../utils/auth';

const router = Router();

// register route works off base route
router.post('/register', validateUserRegistration, async (request, response, next) => {
  try {
    // Get user information from the request body
    const user = new User(request.body);
    // Hashing of password exists as a pre-save hook
    await user.save();

    const token = generateToken(user);

    return response.status(201).json({
      success: true,
      message: 'User registration complete',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        ...(user.isAdmin && { isAdmin: user.isAdmin }), // Only returns isAdmin if it is truthy
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', validateLogin, async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(401).json({
        success: false,
        message: 'Authentication failed: Incorrect email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({
        success: false,
        message: 'Authentication failed: Incorrect email or password',
      });
    }

    const token = generateToken(user);

    return response.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        ...(user.isAdmin && { isAdmin: user.isAdmin }), // Only returns isAdmin if it is truthy
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (request, response) => {
  return response.status(200).json({
    success: true,
    message: 'Log out successful',
  });
});

export default router;
