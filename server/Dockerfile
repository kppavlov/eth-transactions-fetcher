# Use the official Node.js image
FROM node:22-alpine

# Set the working directory for the application
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

COPY . .

# Install Node.js dependencies
RUN npm install

# Build the code for production
RUN npm run build

ENV API_PORT=3000 \
    ETH_NODE_URL='https://ethereum-sepolia-rpc.publicnode.com' \
    DB_CONNECTION_URL='postgres://lime:limetestpass@localhost:2345/postgres' \
    JWT_SECRET='somerandomesecret'

# Expose the API port and PostgreSQL port
EXPOSE ${API_PORT}

# Default command to start PostgreSQL and Node.js
CMD ["node", "./dist/index.js"]
