# Slim version for smaller image size, bash and curl useful for debugging not included in alpine
FROM node:22-slim

# Update package cache, install libcurl (needed by mongodb-memory-server for tests), cleanup cache 
RUN apt-get update && apt-get install -y libcurl4 && rm -rf /var/lib/apt/lists/*

# Create working directory in container filesystem and set as default location for instructions
WORKDIR /app

# Build first layer using only package files so second layer is only rebuilt on dependency changes
COPY package*.json ./

# Build second layer by installing dependencies, ci instead of install is faster & more consistent 
RUN npm ci

# Build third layer from remaining app code. Changes to this now wont re-trigger npm ci
COPY . .

# Expose port 5000 as metadata telling which port the app runs on
EXPOSE 5000

# Run start command to launch server when container starts
CMD ["npm", "run", "start"]