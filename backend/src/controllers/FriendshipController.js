import Friendship from '../models/Friendship';
import User from '../models/User';

// // Admin route to get all friendships - for admin overview purposes
// router.get('/', verifyToken, requireAdmin, getAllFriendships);
export const getAllFriendships = async (req, respond, next) => {
  try {
    // Database query to get all friendships documents
    const friendships = await Friendship.find();

    return respond.status(200).json({
      success: true,
      // returns the list of all friendships data
      // If the friendships doc is empty, then return an empty array
      friendships,
    });
  } catch (error) {
    return next(error);
  }
};

// // Get list friends using attached user.userId OR specific user by param (admin only)
// router.get('/my-friends', verifyToken, getUserFriendships);
// router.get('/:userId', verifyToken, requireAdmin, getUserFriendships);
export const getUserFriendships = async (req, respond, next) => {
  try {
    // Get id from req parameters or user object
    const userId = req.params?.userId || req.user.userId;
    // // Database query to get friendships for the specific user
    const friendships = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }],
    });
    // Return success message with friendships array (empty if no friends) for this user
    return respond.status(200).json({
      success: true,
      friendships,
    });
  } catch (error) {
    return next(error);
  }
};

// // Create a friendship
// router.post('/:recipientUserId', verifyToken, createFriendship);
export const createFriendship = async (req, res, next) => {
  try {
    // Get id of requester from attached user object in req (from verifyToken middleware)
    const requesterUserId = req.user.userId; // decoded user id from JWT token
    // Get id of recipient from req parameters
    const recipientUserId = req.params?.recipientUserId;

    //  Validation check - check recipient user exists, if not return 400 bad request
    const recipientUser = await User.findById(recipientUserId).exec();
    if (!recipientUser) {
      return res.status(400).json({
        success: false,
        message: 'Provided recipient user does not exist',
      });
    }
    // Create new friendship document in the database
    const newFriendship = await Friendship.create({
      user1: requesterUserId,
      user2: recipientUserId,
      requesterUserId,
    });
    // Return the created friendship
    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      friendship: newFriendship,
    });
  } catch (error) {
    return next(error);
  }
};

// Update friendships
// router.put('/my-friends/:requesterUserId', verifyToken, updateFriendship);
// router.put('/', verifyToken, updateFriendship);
export const updateFriendship = async (req, res, next) => {
  try {
    // Get recipient id from req body or attached user object
    const recipientUserId = req.body?.recipientUserId || req.user.userId;
    const requesterUserId = req.body?.requesterUserId || req.params.requesterUserId;

    // Get friendship document by the combination of user1 and user2 ids where requestedUserId is user2
    // Sort id's by smallest id first
    const [user1, user2] = [requesterUserId, recipientUserId].sort();

    // Query the database to find and update the friendship document
    const updatedFriendship = await Friendship.findOneAndUpdate(
      {
        user1,
        user2,
        requesterUserId,
        friendRequestAccepted: false,
      },
      { friendRequestAccepted: true },
      { new: true }, // Return the updated document
    );
    // If returned updated friend request is null, send bad request response
    if (!updatedFriendship) {
      return res.status(400).json({
        success: false,
        message: 'Pending friendship document not found with provided parameters',
      });
    }
    // Else return the updated friendship and success response
    return res.status(200).json({
      success: true,
      message: 'Friend request accepted successfully',
      updatedFriendship,
    });
  } catch (error) {
    return next(error);
  }
};

// // Remove an existing friendship for yourself or another user (admin only)
// router.delete('/my-friends/:otherUserId', verifyToken, removeFriendship);
// router.delete('/', verifyToken, requireAdmin, removeFriendship);
export const removeFriendship = async (req, res, next) => {
  try {
    // Get both IDs from req body or params
    const userId = req.body?.userId || req.user.userId;
    const otherUserId = req.body?.otherUserId || req.params.otherUserId;

    // Sort id's by smallest id first
    const [user1, user2] = [userId, otherUserId].sort();

    // Find and delete friendship document from db, returning deleted document or null if not found
    const deletedFriendship = await Friendship.findOneAndDelete({ user1, user2 });

    // If returned updated friend request is null, send bad request response
    if (!deletedFriendship) {
      return res.status(400).json({
        success: false,
        message: 'Friendship document not found with provided parameters',
      });
    }

    // Else return the deleted friendship and success response
    return res.status(200).json({
      success: true,
      message: 'Friendship document deleted successfully',
      deletedFriendship,
    });
  } catch (error) {
    return next(error);
  }
};
