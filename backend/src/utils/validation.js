import User from '../models/User';

// Validation middleware for all user registering, validation for login can happen in route (more basic, instantaneous response)
const validateUserRegistration = async (request, response, next) => {
  try {
    //  Reuse schema validation rules for DRY coding principles
    const tempUser = new User(request.body);
    await tempUser.validate();

    // Checks for unique username and email separately using $or
    const existingUser = await User.findOne({
      $or: [{ email: request.body.email }, { username: request.body.username }],
    });

    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: 'Email or username already exists',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const validateLogin = (request, response, next) => {
  const { email, password } = request.body;

  // IF there is no email or password provided
  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  return next();
};

// Validates all post requests for ReelProgress records, otherwise extra
// or incorrect data will be silently removed
const validateReelProgress = (request, response, next) => {
  // Set up allowed fields to protect subdocument from extra data
  const allowedFields = ['movie', 'rating', 'isWatched'];
  // Gets the fields which were extra so they can be passed back to the user
  const extraFields = Object.keys(request.body).filter((field) => !allowedFields.includes(field));

  // Checks if there were any extra fields in the request body
  if (extraFields.length > 0) {
    return response.status(400).json({
      success: false,
      message: `Unexpected field(s) in reelProgress: ${extraFields.join(', ')}`,
      expectedFields: allowedFields,
    });
  }

  return next();
};

export { validateUserRegistration, validateLogin, validateReelProgress };
