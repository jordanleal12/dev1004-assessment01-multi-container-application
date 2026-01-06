# Troubleshooting

The below table shows a comprehensive view of different examples of error messages returned by the API, the cause, the error type, error code and solution.
HTTP Error codes and their meanings [can be found here:](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

| **Error Type**            | **HTTP Status** | **Error Message Example**                                                                                                                                                   | **Cause**                                 | **Solution**                                          |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| ValidationError           | 400             | {"success": false, "message": "Schema validation failed", "errors": ["Please enter a valid email"]}                                                                         | Invalid email format                      | Provide valid email address                           |
| ValidationError           | 400             | {"success": false, "message": "Schema validation failed", "errors": ["Password must be at least 8 characters long, and contain: one lowercase, uppercase, number, symbol"]} | Weak password                             | Use stronger password meeting all requirements        |
| ValidationError           | 400             | {"success": false, "message": "Schema validation failed", "errors": ["Movie title is required"]}                                                                            | Required field missing                    | Include all required fields in request                |
| CastError                 | 400             | {"success": false, "message": "Cast error: value (12345) is not valid for \_id", "errors": ["Cast to ObjectId failed for value..."]}                                        | Invalid MongoDB ObjectId format           | Use valid 24-character hex ObjectId                   |
| Duplicate Key             | 409             | {"success": false, "message": "Duplicate key violation", "errors": ["User with field: email already exists"]}                                                               | Email already registered                  | Use unique email or login with existing account       |
| Duplicate Key             | 409             | {"success": false, "message": "Duplicate key violation", "errors": ["User with field: username already exists"]}                                                            | Username already taken                    | Choose different username                             |
| Duplicate Key             | 409             | {"success": false, "message": "Email or username already exists"}                                                                                                           | Username or email already exists          | Use unique credentials or login                       |
| Authentication Error      | 401             | {"success": false, "message": "Access denied. No token provided."}                                                                                                          | Missing JWT token                         | Include valid JWT token in Authorization header       |
| Authentication Error      | 401             | {"success": false, "message": "Token is invalid. Please log in again."}                                                                                                     | Invalid or malformed JWT token            | Log in again to get new token                         |
| Authentication Error      | 401             | {"success": false, "message": "Your session has expired. Please log in again to refresh."}                                                                                  | JWT token expired (>24hrs)                | Log in again to refresh token                         |
| Authentication Error      | 401             | {"success": false, "message": "User no longer exists"}                                                                                                                      | User deleted but token still valid        | Register new account or contact admin                 |
| Authentication Error      | 401             | {"success": false, "message": "Authentication failed", "errors": ["Incorrect email or password"]}                                                                           | Invalid login credentials                 | Check email and password are correct                  |
| Authentication Error      | 401             | {"success": false, "message": "Invalid current password"}                                                                                                                   | Wrong current password on update          | Provide correct current password                      |
| Authorization Error       | 403             | {"success": false, "message": "Access denied. Admin privileges required."}                                                                                                  | Non-admin accessing admin route           | Use admin account or request admin privileges         |
| Authorization Error       | 403             | {"success": false, "message": "Cannot delete movies created by other users"}                                                                                                | Attempting to delete another user's movie | Only delete your own movies                           |
| Authorization Error       | 403             | {"success": false, "message": "Reel Canon movies cannot be deleted"}                                                                                                        | Attempting to delete Reel Canon movie     | Reel Canon movies are protected and cannot be deleted |
| Database Connection Error | 503             | {"success": false, "message": "Could not connect to database"}                                                                                                              | MongoDB connection failed                 | Check DATABASE_URI and ensure MongoDB is running      |
| Server Error              | 500             | {"success": false, "message": "An unexpected error occurred. Please try again later."}                                                                                      | Unhandled server error                    | Check server logs and report issue if persistent      |

## Common Issues and Solutions

### MongoDB Connection Issues

- **Problem**: Cannot connect to MongoDB
- **Solutions**:
  - Ensure MongoDB is running locally: `sudo systemctl status mongod` if using local database, else check cloud database is running correctly
  - Check DATABASE_URI or LOCAL_DB_URI in `.env` file to ensure correct db connection string is being used
  - Check MongoDB Atlas IP whitelist settings

### Authentication Issues

- **Problem**: "Access denied. No token provided."
- **Solutions**:
  - Include JWT token in header
  - Log in to receive valid token
  - Ensure token is not expired

### Validation Errors

- **Problem**: Schema validation failed
- **Solutions**:
  - Check all required fields are provided
  - Ensure data types match schema requirements
  - Verify string lengths meet min/max requirements
  - Use valid email format and strong passwords

### Seeding Issues

- **Problem**: Movies fail to seed
- **Solutions**:
  - Add valid OMDB_API_KEY to `.env` file
  - Check internet connectivity for OMDB API access
  - Ensure database is running and accessible
  - Run `npm run drop` before seeding for clean slate

---
