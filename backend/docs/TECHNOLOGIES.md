# Technologies

## Table of Contents

1. [Overview](#1-overview)
2. [Core Dependencies](#2-core-dependencies)
3. [Development Dependencies](#3-development-dependencies)
4. [Hardware Requirements](#4-hardware-requirements)
5. [Software Requirements](#5-software-requirements)
6. [Licensing](#6-licensing)

---

## 1. Overview

The following documentation outlines the relevance and impact of the utilised hardware and software technologies within this software project

---

## 2. Core Dependencies

These are the core dependencies utilized by this API

### Node.js

- **Industry Relevance**: As of the most recent [Stack Overflow Survey](https://survey.stackoverflow.co/2025/technology/) Node.js remains the most used JS runtime environment, both amongst professional developers and student developers, with 48% of developers having used it extensively in their projects. Node.js has wide community support, and is still the most accessible runtime environment, no matter what JS framework you are using for your API. Node is also open source, allowing for flexible use and project specific manipulation.
- **Purpose & Usage**: Node.js executes all server-side Javascript. It essentially allows all of our coded .js files to run without the need for a browser to interpret JS language. Node.js allows us to develop our entire stack using unified JavaScript code, unlike other runtime environments which may fragment development into separate languages.
- **Comparison**:
  - **Deno**: A newer JS runtime by the same creator as Node.js, with built in TypeScript support. The ecosystem itself is smaller, with less support and community use. Though it includes more built in packages, it is not well maintained. Node.js better serves our application due to wide community support and thorough documentation.
  - **Bun**: A smaller but all-in-one JS toolkit, it is written in Zig (a newer systems programming language) which offers better performance in comparison to Node's C++ architecture. Again, the ecosystem and community support for Bun is not wide, and it does involve a higher learning curve than Node.js, and can be difficult to troubleshoot due to lower uptake across the dev community.
- **License**: MIT License

### Express.js

- **Industry Relevance:** As of the most recent [State of Javascript Survey](https://2024.stateofjs.com/en-US/other-tools/#backend_frameworks) Express.js is still the most used back-end framework, with 68% of respondents having used it in their development. It is still the foundation for many other frameworks (Nest.js, Feathers, LoopBack) and has a huge amount of accessible documentation and community support.
- **Purpose & Usage:** Express.js serves as the back-end web framework for our Single Page Application (SPA) for routing, middleware, and API endpoint management. It facilitates communication between the front-end client and our MongoDB database.
- **Comparison:**
  - **Django**: A Python based web framework which is not applicable for our MERN stack architecture plan. Django APIs tend to have more boilerplate, and work more seamlessly with SQL databases, as opposed to our MongoDB NoSQL database.
  - **Spring Boot**: A Java based framework that requires more configuration, and has a steeper learning curve. It has many powerful in built libraries which can be implemented easily in enterprise applications, however it's heavier than needed for our MERN stack, and would likely introduce unnecessary complexity.
  - **Next.js**: A React-based full-stack framework with limited back-end capabilities. Our architecture plan relies on separation of concerns to ensure security and database integrity, and though capable, Next.js offers less back-end API flexibility compared to a dedicated Express.js back-end.
  - **Nest.js**: A TypeScript based framework built on Express that provides more structure, but adds layers of abstraction which, due to the scope and scale of our application, are not necessary and would lead to over-engineered boilerplate.
- **License:** MIT License

### MongoDB & Mongoose

- **Industry Relevance:** As of the most recent [Stack Overflow Developer Survey](https://survey.stackoverflow.co/2024/technology#most-popular-technologies-database) MongoDB is the highest ranked NoSQL database, with 24.8% of developers using it in their development. It is also the most used amongst those learning to code. It has strong community support and well written comprehensive documentation. Mongoose ODM is widely used, reaching over 5million weekly downloads on npm, and its support of schema enforcement and middleware hooks provide high data integrity standards which MongoDB's native drivers lack.
- **Purpose & Usage:** MongoDB serves as our primary database, while Mongoose uses schema and middleware hooks to sanitise and protect our data integrity. This allows us to enforce data hashing for private information, as well as protecting our database from malicious data injection.
- **Comparison:**
  - **SQL Databases**: SQL databases enforce greater data protection, and enforced relationships. Using a noSQL database is more appropriate for our application, allowing for flexible documents, faster queries, and better long term scalability. The MERN stack's shared JavaScript ecosystem (MongoDB, Express, React, Node) allows more natural development cycle, with Mongoose providing seamless MongoDB integration.
  - **Redis**: A key-value in-memory NoSQL storage system. Redis is the fastest option for caching and session management, however that data is ephemeral. Our application requires persistent, frequently updated user documents and movie information, that demand reliable data persistence. Persistent data is also more aligned with our front-end state requirements.
  - **Cassandra**: A wide-column storage system designed for massively scalable implementation across multiple data centres. Write heavy applications are more suited to Cassandra, however complex setup and eventual consistency model (updates are not always real-time in every node) make it less appropriate for our application. MongoDB also provides more document flexibility, better real-time updates (ratings are immediate for all users) and a more developer friendly query interface.
  - **Firebase/Firestore** Google's managed NoSql database, with real-time features, widely used in mobile applications. While the features available in Firebase Firestore are powerful, it is also locked to the vendor, and requires ongoing costs for use.
- **License:**
  - **Mongoose**: MIT License
  - **MongoDB**: Apache 2.0

### JSON Web Tokens

- **Industry Relevance:** JSON Web Token (JWT) is widely used, with nearly 20million weekly downloads on npm. It is also one of the most starred authentication libraries on GitHub, showing massive community adoption and support. JWT is also supported by all major cloud providers (AWS, Google Cloud, Azure), and is defined by the [IETF](https://datatracker.ietf.org/doc/html/rfc7519) ensuring compatibility across multiple platforms.
- **Purpose & Usage:** JWT creates secure authentication tokens, which are used across all authorised routes in our application. A securely stored encryption key ensures encrypted payloads are never exposed unintentionally.
- **Comparison:**
  - **Session Based Authentication**: Authentication is managed through the server-side database. This is more secure for sensitive data as it held in the database, but creates extra storage on databases, as well as bottlenecking of connections as the application scales. JWT works for our application's scale and current security requirements.
  - **OAuth 2.0 / OpenID Connect**: Authentication via third party access, which can use JWT to manage the access tokens securely. While this is a common modern approach to authentication, it does not necessarily suit our application's current needs.
  - **PASETO**: A more recent alternative to JWT, which addresses some security concerns associated with JWT. Currently it is not as widely used or supported as JWT, but offers more comprehensive security via mandatory strong encryption, and protection against algorithm confusion attacks. For the current level of traffic and users to our application we do not require this level of security.
- **License:** MIT License

### bcrypt

- **Industry Relevance:** bcrypt is a popular hashing package, with more than 2million weekly downloads, and wide use and support across the community. It is slowly being replaced by more modern and secure frameworks, however it is currently still the fastest method of hashing, and given sufficient work factors (12 in our application) is still considered secure by OWASP.
- **Purpose & Usage:** bcrypt is used to securely hash passwords before storage in our database. This ensures that passwords are never stored in plain text format. bcrypt is also used to compare passwords upon login. Passwords are further secured by never being included in responses to users in either form.
- **Comparison:**
  - **Argon2**: Winner of Password Hashing Competition, is considered the most secure modern option. The process requires more computational memory and resources, and is not required for the current scale of our application.
  - **Scrypt**: Designed to be memory-hard, and more resistant to memory attacks. However much more complex to implement with a much higher learning curve. This may be implemented before v1.0.0 of our application to address any security concerns.
  - **PBKDF2**: Incredibly robust levels of work-factors, intended for enterprise level security. More complex to implement, and far beyond the level of security we need in our application at this stage.
- **License:** MIT License

### CORS

- **Industry Relevance:** CORS (Cross-Origin Resource Sharing) is a package for handling cross origin requests. With over 20 million weekly downloads from npm, and is considered a staple package for most modern web apps with its easy to use setup and robust default settings.
- **Purpose & Usage:** Using this as middleware in our server allows us to enable a front end application to make requests to this API without being blocked by browser security policies, It also allows us to tightly control requests from trusted and untrusted origins, for secure communication between front and backend.
- **Comparison:**
  - **jsonp**: Older, mostly deprecated system for handling cross-origin requests. CORS has better security options and far more adoption in modern apps.
  - **Manual Headers**: An unrealistic approach, setting headers manually for each route is less dry and harder to maintain, as well as increasing chances of errors
- **License:** MIT License

### dotenv

- **Industry Relevance:** Dotenv has over 70 million weekly downloads on npm, showcasing its status as the go to package for reading/working with environment variables in Node applications.
- **Purpose & Usage:** Loads environment variables from the `.env`, letting us manage configuration data (e.g. API keys, database strings, JWT encoding strings) without exposing it in the source code. This improves security and allows multiple setups in different environments like development, testing, and production.
- **Comparison:**
  - **Environment Variables Only**: Devs can manually use environment variables but this is less safe and more error prone
  - **Node-config:**: This has a lot of additional features, however the added complexity and learning curve for features we do not require was unsuitable for the scale of our project
- **License:** BSD-2-Clause

### Helmet

- **Industry Relevance:** A HTTP security headers middleware package, with over 5 million weekly npm downloads, helmet is a widely trusted and easy to use package for setting default or custom security headers for an application.
- **Purpose & Usage:** HTTP security headers are set to default tried and tested settings when helmet is declared as app wide middleware (e.g. Content-Security-Policy, X-Frame-Options, etc) which protects against common web attacks and vulnerabilities. Custom settings can be applied also.
- **Comparison:**
  - **Manual Header Configuration**: Error prone with an in depth understanding of security headers to be effective.
  - **Security.txt Only**: Lets you set basic security information but not as comprehensive as helmet
- **License:** MIT License

### node-fetch

- **Industry Relevance:** With over 12 million weekly downloads, node-fetch allows the application to make HTTP requests using Node.
- **Purpose & Usage:** In our application, node-fetch is used to make HTTP requests to the OMDb API for fetching movie metadata during database seeding. It provides a simple, promise-based interface for making GET/POST requests to external services, replacing the older callback-based `http` module with modern async/await patterns.
- **Comparison:**
  - **axios**: More powerful, feature rich library, but with its steeper learning curve its features are not required for our basic implementation
  - **request**: A deprecated library that is no longer maintained. node-fetch is the modern replacement.
- **License:** MIT License

### tsx

- **Industry Relevance:** Modern TypeScript executor that provides typescript support and hot reloading.
- **Purpose & Usage:** Significantly simplifies our script commands and allows for easier importing and exporting of es6 modules
- **Comparison:**
  - **ts-node**: Earlier ts library that is slower and has more overhead than tsx
  - **esbuild**: Extremely fast JavaScript bundler but focused on production builds rather than development experience. tsx is better suited for development workflows.
- **License:** MIT License

### validator

- **Industry Relevance:** A popular validation/sanitization library with over 16 million weekly downloads, it excels at general validation.
- **Purpose & Usage:** Used in our models/schemas for validating input during schema/model level validation. Protects our database against injection attacks and allows validated and sanitized data only to be saved to our database.
- **Comparison:**
  - **Joi**: A heavy, feature rich alternative. The simplicity of validator was more appropriate for our use case.
  - **Yup**: Super lightweight validation, validator had specific string validation functions that we required that this package didn't
- **License:** MIT License

---

## 3. Development Dependencies

The following dependencies are dev dependencies only, not required for production

- **faker**: Generates realistic fake data for testing and database seeding
- **jest**: Provides testing framework for unit and integration tests with coverage reporting
- **eslint**: Identifies and fixes code quality issues according to style guide rules
- **mongodb-memory-server**: Creates in-memory MongoDB instances for isolated testing
- **prettier**: Formats code automatically to maintain consistent styling
- **supertest**: Tests HTTP endpoints and API responses with fluent assertions

## 4. Hardware Requirements

Modern computer systems are required to develop and run this application. There is no official standard for hardware requirements for the backend of a MERN application, however general recommendations are as follows:

- **Processor:** Modern multi-core processor (Intel Core i5/AMD Ryzen 5 or equivalent, 2+ GHz)
- **RAM:** Minimum 8GB for comfortable development (16GB+ recommended for running tests and development server simultaneously)
- **Storage:** Minimum 2GB free disk space for project dependencies and database operations
- **Internet Connection:** Reliable internet connection for package downloads, database connectivity (especially for MongoDB Atlas cloud hosting), and external API calls (OMDb API)

## 5. Software Requirements

The following software and tools are required to develop and deploy this application:

- **Operating System:** Node.js compatible OS - Windows, macOS, or Linux (Ubuntu 18+, Fedora 29+, etc.)
- **Runtime Environment:**
  - Node.js 18.x or higher
  - npm 9.x or higher
- **Development Tools:**
  - Visual Studio Code or similar code editor
  - Terminal/Command line interface (Git Bash on Windows, Terminal on macOS, terminal on Linux)
  - Git for version control
- **Database:**
  - MongoDB 4.4+ (either local installation or MongoDB Atlas cloud account for hosted database)
  - mongosh (MongoDB shell) for manual database queries if needed
- **API Testing Tools:**
  - HTTP client for testing endpoints (e.g. Bruno, Insomnia)
  - Useful for manual testing during development and debugging
- **Optional but Recommended:**
  - GitHub account (for version control and easy deployment using GitHub integration)

## 6. Licensing

| Package                   | License      |
| ------------------------- | ------------ |
| @faker-js/faker           | MIT          |
| @jest/globals             | MIT          |
| bcrypt                    | MIT          |
| cors                      | MIT          |
| dotenv                    | BSD-2-Clause |
| eslint-config-airbnb-base | MIT          |
| eslint-config-prettier    | MIT          |
| eslint-plugin-import      | MIT          |
| eslint-plugin-prettier    | MIT          |
| eslint                    | MIT          |
| express                   | MIT          |
| helmet                    | MIT          |
| jest                      | MIT          |
| jsonwebtoken              | MIT          |
| mongodb-memory-server     | MIT          |
| mongodb                   | Apache-2.0   |
| mongoose                  | MIT          |
| node-fetch                | MIT          |
| prettier                  | MIT          |
| supertest                 | MIT          |
| tsx                       | MIT          |
| validator                 | MIT          |
