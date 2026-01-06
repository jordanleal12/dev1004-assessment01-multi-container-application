# Using the API

## Table of Contents

1. [Overview](#1-overview)
2. [Scripts](#2-scripts)
3. [Home & Health](#3-home--health)
4. [Authentication](#4-authentication)
5. [Users](#5-users)
6. [Movies](#6-movies)
7. [Reel Progress](#7-reel-progress)
8. [Friendships](#8-friendships)
9. [Leaderboard](#9-leaderboard)

## 1. Overview

This API is deployed using Render, available at [The Reel Canon](https://the-reel-canon.onrender.com/).
Below are all of the API endpoints with descriptions, as well as the CRUD functionality that they provide, examples of output, and required JSON input structure.

**Authentication:** Most endpoints require JWT authentication. Include the token in the Authorization header: `Authorization: Bearer <your_jwt_token>`

Tokens are valid for 24 hours and are received upon successful login or registration.

---

## 2. Scripts

Below are the available scripts and their purpose:

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run seed:users` - Seed local database with user data
- `npm run drop:users` - Drop ONLY local database user records
- `npm run seed:movies` - Seed local database with movie data
- `npm run seed:movies:deployed` - Seed production database
- `npm run seed:users:deployed` - Seed production database
- `npm run lint` - Check code for style issues
- `npm run lint-fix` - Automatically fix linting errors
- `npm run format` - Format code with Prettier

---

## 3. Home & Health

Basic endpoints for testing API connectivity and database status.

| **Endpoint**     | **CRUD Method** | **Auth Required** | **Description**                                                                 |
| ---------------- | --------------- | ----------------- | ------------------------------------------------------------------------------- |
| /                | GET             | No                | API home page with basic welcome message                                        |
| /echo            | POST            | No                | Echo endpoint to test POST requests - returns received data                     |
| /database-health | GET             | No                | Database connection status and information (development/test environments only) |
| /database-dump   | GET             | No                | Dump all database data (development/test environments only)                     |

**Example GET / output:**

```json
{
  "message": "Welcome to the reel-canon API! Refer to docs/USAGE.md for API endpoint details."
}
```

**Example GET /database-health output (Test or Dev only):**

```json
{
  "readyState": 1,
  "dbName": "movie_db",
  "dbModels": ["User", "Movie", "Friendship"],
  "dbHost": "localhost",
  "dbPort": 27017,
  "dbUser": null
}
```

---

## 4. Authentication

User registration, login, and logout endpoints. All authentication routes are prefixed with `/auth`.

| **Endpoint**   | **CRUD Method** | **Auth Required** | **Description**                                  |
| -------------- | --------------- | ----------------- | ------------------------------------------------ |
| /auth/register | POST            | No                | Create new user account and receive JWT token    |
| /auth/login    | POST            | No                | Authenticate existing user and receive JWT token |
| /auth/logout   | POST            | No                | Logout user (client-side token removal)          |

**User Schema Requirements:**

- **username:** Required, unique, min length=2, string
- **password:** Required, min length=8, must contain: 1 lowercase, 1 uppercase, 1 number, 1 symbol
- **email:** Required, unique, valid email format, lowercase
- **isAdmin:** Boolean, default=false (cannot be set by user during registration)

**Example POST /auth/register request:**

```json
{
  "username": "johnsmith",
  "email": "john.smith@example.com",
  "password": "SecurePass123!"
}
```

**Example POST /auth/register response:**

```json
{
  "success": true,
  "message": "User registration complete",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johnsmith",
    "email": "john.smith@example.com"
  }
}
```

**Example POST /auth/login request:**

```json
{
  "email": "john.smith@example.com",
  "password": "SecurePass123!"
}
```

**Example POST /auth/login response:**

```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johnsmith",
    "email": "john.smith@example.com"
  }
}
```

---

## 5. Users

Full CRUD functionality for user entities. Most routes require authentication, admin routes require admin privileges.

Below is the user schema:

- **username:** Required, unique, min length=2, string
- **password:** Required, unique, min length=8, minLowercase=1, minUppercase=1, minNumbers=1, minSymbols=1, string
- **email:** Required, valid email, string
- **isAdmin:** Optional, default=false, boolean
- **reelProgress:** Array, see reelProgress schema below

reelProgress schema:

- **movie:** Required, unique, ObjectId
- **rating:** Optional, min-max=1-5, number
- **isWatched:** Optional, default=false, boolean
- **timestamps:** Creates/updates timestamp on creation/modification

| **Endpoint**                      | **CRUD Method** | **Auth Required** | **Description**                                   |
| --------------------------------- | --------------- | ----------------- | ------------------------------------------------- |
| /users                            | GET             | Yes               | Retrieve list of all users                        |
| /users/my-profile                 | GET             | Yes               | Retrieve current user's profile                   |
| /users/:userId                    | GET             | Admin             | Retrieve specific user profile by ID              |
| /users/my-profile                 | PUT             | Yes               | Update current user's profile                     |
| /users/:userId                    | PUT             | Admin             | Update another user's profile (admin only)        |
| /users/my-profile/update-password | PUT             | Yes               | Update current user's password                    |
| /users/my-profile                 | DELETE          | Yes               | Delete current user's profile and associated data |
| /users/:userId                    | DELETE          | Admin             | Delete another user's profile (admin only)        |

**Example GET /users/my-profile response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johnsmith",
      "email": "john.smith@example.com",
      "isAdmin": false,
      "reelProgress": [
        {
          "movie": "507f191e810c19729de860ea",
          "rating": 5,
          "isWatched": true,
          "_id": "507f191e810c19729de860eb",
          "createdAt": "2025-11-03T10:00:00.000Z",
          "updatedAt": "2025-11-03T10:00:00.000Z"
        }
      ]
    }
  }
}
```

**Example PUT /users/my-profile request:**

```json
{
  "username": "johnsmith_updated"
}
```

**Example PUT /users/my-profile/update-password request:**

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

## 6. Movies

Allows full CRUD functionality of movie instances. Initial 100 'Reel Canon' movies are seeded through OMDB API call, with restrictions on creation, deletion and modification. Custom movies that are not 'reel canon' have full CRUD features.

Listed below is the schema:

- **title:** Required, max length=200, string
- **year:** Required, 4-digit string (YYYY format)
- **director:** Required, string
- **genre:** Required, array of strings
- **plot:** Optional, max length=1000, string
- **actors:** Required, array of strings
- **imdbId:** Required, unique, format: "tt" followed by numbers
- **poster:** Required, valid URL string
- **isReelCanon:** Boolean, default=false (auto-set to false for user-created movies)
- **createdBy:** User ID (auto-assigned from JWT token)

| **Endpoint**          | **CRUD Method** | **Auth Required** | **Description**                                    |
| --------------------- | --------------- | ----------------- | -------------------------------------------------- |
| /movies/reel-canon    | GET             | No                | Retrieve all Reel Canon movies (100 curated films) |
| /movies/search?title= | GET             | Yes               | Search for movies by title (query parameter)       |
| /movies/:imdbId       | GET             | Yes               | Retrieve specific movie by IMDb ID                 |
| /movies               | POST            | Yes               | Create new user movie (non-Reel Canon)             |
| /movies/:imdbId       | PATCH           | Admin             | Update movie poster URL (admin only)               |
| /movies/:imdbId       | DELETE          | Yes               | Delete user-created movie (creator or admin only)  |

**Example GET /movies/reel-canon response:**

```json
{
  "success": true,
  "movies": [
    {
      "_id": "507f191e810c19729de860ea",
      "title": "The Shawshank Redemption",
      "year": "1994",
      "director": "Frank Darabont",
      "genre": ["Drama"],
      "plot": "Two imprisoned men bond over a number of years...",
      "actors": ["Tim Robbins", "Morgan Freeman"],
      "imdbId": "tt0111161",
      "poster": "https://m.media-amazon.com/images/...",
      "isReelCanon": true
    }
  ]
}
```

**Example GET /movies/search?title=Inception response:**

```json
{
  "success": true,
  "message": "Found 1 movie with title \"Inception\"",
  "movies": [
    {
      "_id": "507f191e810c19729de860eb",
      "title": "Inception",
      "year": "2010",
      "director": "Christopher Nolan",
      "genre": ["Action", "Sci-Fi", "Thriller"],
      "imdbId": "tt1375666",
      "poster": "https://m.media-amazon.com/images/...",
      "isReelCanon": true
    }
  ]
}
```

**Example POST /movies request:**

```json
{
  "title": "My Favorite Film",
  "year": "2024",
  "director": "Jane Director",
  "genre": ["Drama", "Thriller"],
  "plot": "A compelling story about...",
  "actors": ["Actor One", "Actor Two"],
  "imdbId": "tt9999999",
  "poster": "https://example.com/poster.jpg"
}
```

**Example PATCH /movies/:imdbId request (Admin only):**

```json
{
  "poster": "https://new-poster-url.com/image.jpg"
}
```

---

## 7. Reel Progress

Track user progress through their movie watching journey. Reel Progress is an embedded subdocument within the User model.

| **Endpoint**                 | **CRUD Method** | **Auth Required** | **Description**                                            |
| ---------------------------- | --------------- | ----------------- | ---------------------------------------------------------- |
| /reel-progress               | GET             | Yes               | Retrieve current user's Reel Progress                      |
| /reel-progress               | POST            | Yes               | Add movie to current user's Reel Progress                  |
| /reel-progress/:movieId      | PATCH           | Yes               | Update rating for movie in current user's Reel Progress    |
| /reel-progress/:movieId      | DELETE          | Yes               | Remove movie from current user's Reel Progress             |
| /reel-progress/admin         | GET             | Admin             | Get all Reel Progress records for all users (admin only)   |
| /reel-progress/admin/queries | DELETE          | Admin             | Delete specific Reel Progress record by query (admin only) |

**Example GET /reel-progress response:**

```json
{
  "success": true,
  "message": "Reel Progress records found",
  "reelProgress": [
    {
      "movie": "507f191e810c19729de860ea",
      "rating": 5,
      "isWatched": true
    },
    {
      "movie": "507f191e810c19729de860eb",
      "rating": null,
      "isWatched": false
    }
  ]
}
```

**Example POST /reel-progress request:**

```json
{
  "movie": "507f191e810c19729de860ea",
  "rating": 4,
  "isWatched": true
}
```

**Example POST /reel-progress response:**

```json
{
  "success": true,
  "message": "The Shawshank Redemption added to your Reel Progress",
  "addedMovieId": "507f191e810c19729de860ea"
}
```

**Example PATCH /reel-progress/:movieId request:**

```json
{
  "rating": 5
}
```

**Example PATCH /reel-progress/:movieId response:**

```json
{
  "success": true,
  "message": "Rating updated",
  "updatedRecord": {
    "movie": "507f191e810c19729de860ea",
    "rating": 5,
    "isWatched": true
  }
}
```

---

## 8. Friendships

Allow full CRUD functionality of friendship instance, which is a junction table between two users. Social features allowing users to connect and share their movie progress. Friendships require mutual acceptance.

Listed below is the schema:

- **user1:** Required, MongoDB ObjectId (smaller ID stored first)
- **user2:** Required, MongoDB ObjectId (larger ID stored second)
- **requesterUserId:** Required, MongoDB ObjectId (who initiated the request)
- **friendRequestAccepted:** Boolean, default=false
- **timestamps:** createdAt and updatedAt automatically tracked

| **Endpoint**                             | **CRUD Method** | **Auth Required** | **Description**                              |
| ---------------------------------------- | --------------- | ----------------- | -------------------------------------------- |
| /friendships                             | GET             | Admin             | Get all friendships (admin only)             |
| /friendships/my-friends                  | GET             | Yes               | Get current user's friend list               |
| /friendships/:userId                     | GET             | Admin             | Get specific user's friend list (admin only) |
| /friendships/:recipientUserId            | POST            | Yes               | Send friend request to another user          |
| /friendships/my-friends/:requesterUserId | PUT             | Yes               | Accept friend request from another user      |
| /friendships                             | PUT             | Admin             | Update friendship (admin only)               |
| /friendships/my-friends/:otherUserId     | DELETE          | Yes               | Remove friendship with another user          |
| /friendships                             | DELETE          | Admin             | Remove friendship (admin only)               |

**Example GET /friendships/my-friends response:**

```json
{
  "success": true,
  "friendships": [
    {
      "_id": "507f191e810c19729de860ec",
      "user1": "507f1f77bcf86cd799439011",
      "user2": "507f1f77bcf86cd799439012",
      "requesterUserId": "507f1f77bcf86cd799439011",
      "friendRequestAccepted": true,
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-02T10:00:00.000Z"
    }
  ]
}
```

**Example POST /friendships/:recipientUserId response:**

```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "friendship": {
    "_id": "507f191e810c19729de860ec",
    "user1": "507f1f77bcf86cd799439011",
    "user2": "507f1f77bcf86cd799439012",
    "requesterUserId": "507f1f77bcf86cd799439011",
    "friendRequestAccepted": false,
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**Example PUT /friendships/my-friends/:requesterUserId response:**

```json
{
  "success": true,
  "message": "Friend request accepted successfully",
  "updatedFriendship": {
    "_id": "507f191e810c19729de860ec",
    "user1": "507f1f77bcf86cd799439011",
    "user2": "507f1f77bcf86cd799439012",
    "requesterUserId": "507f1f77bcf86cd799439012",
    "friendRequestAccepted": true,
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:30:00.000Z"
  }
}
```

---

## 9. Leaderboard

Public leaderboard displaying users ranked by their Reel Progress count.

| **Endpoint** | **CRUD Method** | **Auth Required** | **Description**                                            |
| ------------ | --------------- | ----------------- | ---------------------------------------------------------- |
| /leaderboard | GET             | No                | Get leaderboard of all users ranked by Reel Progress count |

**Example GET /leaderboard response:**

```json
{
  "success": true,
  "message": "Found 5 users with Reel Progress",
  "reelProgressData": [
    {
      "_id": "johnsmith",
      "reelProgressCount": 45
    },
    {
      "_id": "janedoe",
      "reelProgressCount": 38
    },
    {
      "_id": "moviebuff",
      "reelProgressCount": 32
    }
  ],
  "updatedAt": "Sun Nov 03 2025 10:00:00 GMT+0000"
}
```

---

## Common Response Patterns

**Success Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error message"]
}
```

**Validation Error Response:**

```json
{
  "success": false,
  "message": "Schema validation failed",
  "errors": ["Password must be at least 8 characters long...", "Please enter a valid email"]
}
```

---
