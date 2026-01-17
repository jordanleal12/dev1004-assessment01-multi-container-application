# Installation and Deployment

Below are the installation instructions to setup and deploy this API either locally or hosted via cloud. Refer to the [requirements section](./README.md#technology-stack) in the README for pre-requisites.

## Contents

- [Linux/WSL/Mac](#linuxwslmac)
- [Windows CMD](#windows-cmd)

## Linux/WSL/Mac

1. Verify version

   ```bash
   node --version # Should show 22.x or later
   npm --version  # Should show 11.x or later
   ```

2. Download and extract API to desired folder
   **OR**
   clone from [GitHub repository](https://github.com/CoderAcademy-DEV-MERN-Group/DEV1003-Assessment02)

   ```bash
   git clone https://github.com/CoderAcademy-DEV-MERN-Group/DEV1003-Assessment02.git
   cd DEV1003-Assessment02
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Create MongoDB Database
   - **For cloud hosting:**
     In [MongoDB Atlas Console](https://cloud.mongodb.com/) (or other provider) create a new MongoDB database cluster, then save the connection string.
   - **For local hosting:**
     Follow the commands in the [MongoDB Community Edition Installation Guide](https://www.mongodb.com/docs/manual/administration/install-community/?operating-system=linux&linux-distribution=ubuntu&linux-package=default&search-linux=with-search-linux#std-label-install-mdb-community-edition). Select your operating system, and other applicable options from the drop down menus to receive system specific installation instructions.
     Follow the commands below the installation instructions to start, and then run your local instance of mongoDB
5. Add Environment Variables

   ```bash
   cat > .env << EOL
   LOCAL_DB_URI=mongodb://localhost:27017/movie_db
   DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/movie_db
   OMDB_API_KEY=<your_omdb_api_key>
   JWT_SECRET_KEY=<your-generated-secret-key>
   TOKEN_HEADER_KEY=authorization
   EOL # Add the end EOL separately if copy-pasting
   ```

   - Replace `DATABASE_URI` string with your MongoDB Atlas connection string if cloud hosting your database
   - For local development, the `LOCAL_DB_URI` is used automatically
   - Obtain an API key from [OMDb API](https://www.omdbapi.com/apikey.aspx) (free tier available)
   - Generate secret key in console with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - DO NOT SHARE SECRET KEY! Ensure `.env` file is listed in `.gitignore`

6. Initialize Database
   - Sample seed data has been provided in `src/database/seedMovies.js` and `src/database/seedUsers.js`
   - The movies seed requires a valid OMDB_API_KEY to fetch movie metadata

   ```bash
   npm run drop          # Drop existing database (ensures existing database is clear)
   npm run seed:movies   # Seeds database with 100 movies from Reel Canon
   npm run seed:users    # Seeds database with sample users and ratings
   ```

7. Run Development Server (for development environment only)

   ```bash
   npm run dev  # Starts development server with hot reload
   ```

   Server will run at `http://localhost:5000` by default

8. Deploy Online - Skip If Deploying Locally Only
   - Sign up at [Render](https://render.com/) or [Railway](https://railway.app/)
   - Click **New** and select **Web Service**
   - Link your GitHub repository with this cloned project and select the repository
   - Fill in the configuration form:
     - Add your desired **Name**
     - Choose Node for **Language/Environment**
     - Select the closest **Region**
     - Set **Build Command** to `npm install`
     - Set **Start Command** to `npm start`
     - Select desired **Instance Type**
     - Add the **Environment Variables** defined in your `.env`:
       - `DATABASE_URI` (use your MongoDB Atlas connection string)
       - `JWT_SECRET_KEY`
       - `TOKEN_HEADER_KEY`
       - `OMDB_API_KEY` (optional - only needed for seeding)
       - `NODE_ENV=production`
     - Click **Deploy Web Service**
   - Once deployed, run seed commands using Render Shell or Railway CLI:

     ```bash
     npm run seed:movies:deployed  # Seeds movies in production
     npm run seed:users:deployed   # Seeds users in production
     ```

   - Test your endpoints using the provided deployment URL

---

## Windows CMD

**_Use CMD not PowerShell_**

1. Verify version

   ```cmd
   node --version
   REM Should show 22.x or later
   npm --version
   REM Should show 11.x or later
   ```

2. Download and extract API to desired folder
   **OR**
   clone from [GitHub repository](https://github.com/CoderAcademy-DEV-MERN-Group/DEV1003-Assessment02)

   ```cmd
   git clone https://github.com/CoderAcademy-DEV-MERN-Group/DEV1003-Assessment02
   cd DEV1003-Assessment02
   ```

3. Install dependencies

   ```cmd
   npm install
   ```

4. Create MongoDB Database
   - **For cloud hosting:**
     In [MongoDB Atlas Console](https://cloud.mongodb.com/) (or other provider) create a new MongoDB database cluster, then save the connection string.
   - **For local hosting:**
     Follow the commands in the [MongoDB Community Edition Installation Guide](https://www.mongodb.com/docs/manual/administration/install-community/?operating-system=windows&windows-installation-method=wizard). Select your operating system, and installation method to receive system specific installation instructions.
     Follow the commands below the installation instructions to start, and then run your local instance of mongoDB

   ```cmd
   REM Verify MongoDB is installed
   mongod --version

   REM MongoDB should start automatically as a Windows Service
   REM Check service status in Services app (Win + R, type 'services.msc')

   REM Your local database will be available at: mongodb://localhost:27017/movie_db
   ```

5. Add Environment Variables

   ```cmd
   echo LOCAL_DB_URI=mongodb://localhost:27017/movie_db > .env
   echo DATABASE_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/movie_db >> .env
   echo OMDB_API_KEY=<your_omdb_api_key> >> .env
   echo JWT_SECRET_KEY=<your-generated-secret-key> >> .env
   echo TOKEN_HEADER_KEY=authorization >> .env
   ```

   - Replace `DATABASE_URI` string with your MongoDB Atlas connection string if cloud hosting your database
   - For local development, the `LOCAL_DB_URI` is used automatically
   - Obtain an API key from [OMDb API](https://www.omdbapi.com/apikey.aspx) (free tier available)
   - Generate secret key in console with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - DO NOT SHARE SECRET KEY! Ensure `.env` file is listed in `.gitignore`

6. Initialize Database
   - Sample seed data has been provided in `src/database/seedMovies.js` and `src/database/seedUsers.js`
   - The movies seed requires a valid OMDB_API_KEY to fetch movie metadata

   ```cmd
   REM Drop existing database (optional - ensures clean slate)
   npm run drop

   REM Seeds database with 100 movies from Reel Canon
   npm run seed:movies

   REM Seeds database with sample users and ratings
   npm run seed:users
   ```

7. Run Development Server (for development environment only)

   ```cmd
   REM Starts development server with hot reload
   npm run dev
   ```

   Server will run at `http://localhost:5000` by default

8. Deploy Online - Skip If Deploying Locally Only
   - Sign up at [Render](https://render.com/) or [Railway](https://railway.app/)
   - Click **New** and select **Web Service**
   - Link your GitHub repository with this cloned project and select the repository
   - Fill in the configuration form:
     - Add your desired **Name**
     - Choose Node for **Language/Environment**
     - Select the closest **Region**
     - Set **Build Command** to `npm install`
     - Set **Start Command** to `npm start`
     - Select desired **Instance Type**
     - Add the **Environment Variables** defined in your `.env`:
       - `DATABASE_URI` (use your MongoDB Atlas connection string)
       - `JWT_SECRET_KEY`
       - `TOKEN_HEADER_KEY`
       - `OMDB_API_KEY` (optional - only needed for seeding)
       - `NODE_ENV=production`
     - Click **Deploy Web Service**
   - Once deployed, run seed commands using Render Shell or Railway CLI:

     ```cmd
     REM Seeds movies in production
     npm run seed:movies:deployed

     REM Seeds users in production
     npm run seed:users:deployed
     ```

   - Test your endpoints using the provided deployment URL

---
