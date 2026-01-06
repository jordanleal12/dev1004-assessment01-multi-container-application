// friendship collection between two users, when user A sends a friend request and userB accepts
// Stores friendships ordered by smallest id first to simplify queries

// Use object destructuring to access mongoose Schema property/method directly
import mongoose, { Schema } from 'mongoose';

const friendshipSchema = new Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The user who initiated sending the friend request
    requesterUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Indicates if the friend request has been accepted
    friendRequestAccepted: {
      type: Boolean,
      default: false,
    },
  },
  // Removed enum option for simplicity, can be expanded later
  // friendRequestStatus: {
  //   type: String,
  //   enum: ['pending', 'accepted', 'rejected'],
  //   default: 'pending',
  // },
  {
    timestamps: true, // Creates and updates createdAt and updatedAt fields
  },
);

/*
Composite unique index:
  - to help with querying and
  - to enforce uniqueness to prevent duplicate friendship records
*/
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Pre-validate hook: check for self-friendship
friendshipSchema.pre('validate', function ValidateSelfFriendRequest(next) {
  // Check if user1 is user2 objectId, trigger validation error
  if (this.user1?.equals(this.user2)) {
    this.invalidate('user1', 'Cannot create friendship with yourself');
  }
  next();
});

// Pre-save hook: enforce ordering of user1 and user2 ObjectIds (by asc order)
friendshipSchema.pre('save', function SortUserIds(next) {
  // Convert user ObjectIds to strings for comparison (bigger > smaller)
  if (this.user1.toString() > this.user2.toString()) {
    // then invert the pair order of users eg. (B, A) = (A, B)
    [this.user1, this.user2] = [this.user2, this.user1];
  }
  next();
});

// Helper static method: Find friendship between two users if exists, returns Friendship document otherwise null
friendshipSchema.statics.findBetween = function ReturnFriendshipDocument(userId1, userId2) {
  const [user1, user2] =
    userId1.toString() < userId2.toString() ? [userId1, userId2] : [userId2, userId1];
  // Return the friendship document if exists between user1 and user2
  return this.findOne({ user1, user2 });
};

// Helper static method: Check if two users are friends (accepted)
friendshipSchema.statics.areFriends = async function CheckIfFriends(userId1, userId2) {
  const friendship = await this.findBetween(userId1, userId2);
  // Returns true only if friendship exists and friendRequestAccepted is true, otherwise false
  return friendship?.friendRequestAccepted === true;
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship;
