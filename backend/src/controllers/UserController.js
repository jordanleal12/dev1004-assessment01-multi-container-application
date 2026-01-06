/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import User from '../models/User';
// import Friendship from '../models/Friendship';
// import { getUserOr404 } from '../utils/userHelperFunctions';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').exec();
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(error);
  }
};

// Get user profile by user object attached to request or params for admins only
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId;
    // Fetch user or return 404 if not found
    const user = await User.findById(userId).select('-password').exec();
    // Return 404 and message if user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: userId ? `User with id ${userId} not found` : 'User ID required',
      });
    }
    // Return success message with user data
    return res.status(200).json({
      success: true,
      user,
    });
    // Catch errors and pass to error handling middleware (in server.js)
  } catch (error) {
    return next(error);
  }
};

// Update user profile by user object attached to request or params for admins only
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId;
    // findByIdAndUpdate only updates provided fields
    const user = await User.findByIdAndUpdate(userId, req.body, {
      new: true, // true returns updated document
      runValidators: true, // true ensures Mongoose schema validators are run on update
    })
      .select('-password') // Prevent password update and exclude from response
      .exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// Update user password with user object and old password verification
export const updateUserPassword = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    // Verify current password before allowing update (for non-admins)
    if (!req.user.isAdmin) {
      const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!validPassword) {
        return res.status(403).json({
          success: false,
          message: 'Invalid current password',
        });
      }
    }
    // Update password and save
    user.password = req.body.newPassword;
    await user.save({ validateBeforeSave: true }); // Ensure validators run on save
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// // Update user password by ID for admins only (commented out for future discussion)
// export const adminUpdateUserPassword = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.userId).exec();
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found',
//       });
//     }
//     // Update password and save
//     user.password = req.body.newPassword;
//     await user.save({ validateBeforeSave: true }); // Ensure validators run on save
//     return res.status(200).json({
//       success: true,
//       message: 'Password updated successfully',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// Delete user profile by ID or optional userId param for admins only
export const deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.userId;
    // Fetch user or return 404 if not found
    const deletedUser = await User.findByIdAndDelete(userId).exec();
    // If user not found, getUserOr404 already sent 404 response, so exit early
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    // Implement logic here to handle deleting associated friendships (and any other related data)
    // await Friendship.deleteMany({}).exec();
    return res.status(200).json({
      success: true,
      message: 'User profile deleted successfully',
      deletedUser,
    });
  } catch (error) {
    return next(error);
  }
};

// Get route for user by name query
