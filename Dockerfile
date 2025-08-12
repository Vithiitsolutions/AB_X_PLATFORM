# Use Node.js version 22 as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Patch Apollo server for restarts
RUN yarn patch-server

# Build the application
RUN yarn build

# Expose ports for both services
EXPOSE 4000

# Run both services
CMD ["yarn", "start"]