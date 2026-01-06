import User from '../../models/User';
import { generateToken } from '../../utils/auth';
import { userFixture } from './fixtures';

// Use this to generate a user with an authentication token, going to be helpful for user tests
export const getAuthToken = async () => {
  const user = await User.create(userFixture());
  const token = generateToken(user);
  return token;
};

// Use this to set the token up in the header for any and all requests, see the MovieRouter for example use
// set authHeader as a blank variable in the top level describe
// in beforeEach, add authHeader = await authenticatedRequest()
// This sets up a token using the above, and adds it to the header using the below! Nifty~!
export const authenticatedRequest = async () => {
  const token = await getAuthToken();
  return { Authorization: `Bearer ${token}` };
};

// For admin requests:
export const getAdminToken = async () => {
  const adminUser = await User.create(userFixture({ username: 'adminuser', isAdmin: true }));
  const token = generateToken(adminUser);
  return token;
};

// for admin requests loaded in the header:
export const adminRequest = async () => {
  const token = await getAdminToken();
  return { Authorization: `Bearer ${token}` };
};
