# The Reel Canon - Multi-Container Application Conversion

## Overview

This repository is a conversion of the existing ['Century Screening Room'](https://github.com/CoderAcademy-DEV-MERN-Group) full stack MERN project I previously worked on. The application was deployed to AWS ECS using the `aws-actions/amazon-ecs-deploy-express-service@v1` action, and combines a frontend React application and a backend API into a multi-container orchestrated deployment.

For detailed documentation on the individual applications, see:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

---

## CI/CD + Containerization Technologies

The following technologies were used specifically for the container conversion and deployment:

| Technology         | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| **Dockerfile**     | Define instructions for containerizing a service                |
| **Docker Compose** | Orchestrate multi-container setup across different environments |
| **Amazon ECR**     | Private, secure container registry to store production images   |
| **Amazon ECS**     | Container orchestration and deployment platform                 |
| **GitHub Actions** | CI/CD automation for building, testing, and deploying           |
| **Nginx**          | Production web server for frontend container                    |

For technologies used in the backend and frontend applications themselves, see:

- [Backend Technologies](./backend/docs/TECHNOLOGIES.md)
- [Frontend Technologies](./frontend/README.md#technologies-used)

---

## Requirements

### For Local Container Development

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Git**: For cloning the repository

### For CI/CD and Deployment

- **AWS Account** with access to ECR and ECS
- **GitHub Repository** with configured secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `AWS_ACCOUNT_ID`
  - `DATABASE_URI`
  - `JWT_SECRET_KEY`
  - `OMDB_API_KEY`
  - `BACKEND_URL`
  - `ECS_EXECUTION_ROLE_ARN`
  - `ECS_INFRASTRUCTURE_ROLE_ARN`

For application-specific requirements (Node.js, MongoDB, etc.), see:

- [Backend Requirements](./backend/docs/TECHNOLOGIES.md#4-hardware-requirements)
- [Frontend Requirements](./frontend/README.md#hardware-requirements)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jordanleal12/dev1004-assessment01-multi-container-application.git
cd dev1004-assessment01-multi-container-application
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
OMDB_API_KEY=<your_omdb_api_key>
JWT_SECRET_KEY=<your_jwt_secret_key>
DATABASE_URI=<your_external_database_uri>
```

### 3. Run with Docker Compose

**Development environment** (with hot reloading):

```bash
docker compose up --build
```

**Test environment**:

```bash
docker compose -f docker-compose.test.yaml up --build
```

**Production environment** (local simulation):

```bash
docker compose -f docker-compose.prod.yaml up --build
```

### 4. Seed the Database (Development)

Once containers are running, seed the database:

```bash
docker exec backend_container npm run seed:movies
docker exec backend_container npm run seed:users
```

For standalone backend/frontend installation without Docker, see:

- [Backend Installation](./backend/docs/INSTALLATION_AND_DEPLOYMENT.md)
- [Frontend Installation](./frontend/README.md)

---

## Usage

### Accessing the Application

| Environment      | Frontend URL                 | Backend API URL            |
| ---------------- | ---------------------------- | -------------------------- |
| Development      | <http://localhost:3000>      | <http://localhost:5000>    |
| Production (ECS) | Configured via load balancer | Configured via ECS service |

### Docker Compose Commands

| Command                     | Description                        |
| --------------------------- | ---------------------------------- |
| `docker compose up`         | Start all services                 |
| `docker compose up --build` | Rebuild and start all services     |
| `docker compose down`       | Stop and remove containers         |
| `docker compose down -v`    | Stop containers and remove volumes |
| `docker compose logs -f`    | Follow container logs              |

### CI/CD Workflows

| Workflow       | Trigger                       | Description                     |
| -------------- | ----------------------------- | ------------------------------- |
| Build and Push | Git tag `v*` or manual        | Builds images and pushes to ECR |
| Deploy         | On successful build or manual | Deploys to ECS                  |
| Test           | Push/PR to main               | Runs automated test suite       |

For API usage and endpoints, see:

- [Backend Usage](./backend/docs/USAGE.md)

---

## Project Structure

```bash
├── .github/workflows/     # CI/CD workflow definitions
├── backend/               # Backend API (Express.js)
│   ├── Dockerfile         # Backend container definition
│   └── ...
├── frontend/              # Frontend app (React/Vite)
│   ├── Dockerfile         # Development container
│   ├── Dockerfile.prod    # Production container (Nginx)
│   └── ...
├── docker-compose.yaml        # Development environment
├── docker-compose.test.yaml   # Test environment
├── docker-compose.prod.yaml   # Production environment
└── README.md
```

---

## Contributors

See individual project documentation for contributor information:

- [Backend Contributors](./backend/README.md#6-contributors)
