import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET_KEY, TOKEN_HEADER_KEY } = process.env;

const jwtConfig = {
  JWT_SECRET_KEY,
  TOKEN_HEADER_KEY: TOKEN_HEADER_KEY || 'Authorization',
};

export default jwtConfig;
