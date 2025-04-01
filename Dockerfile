# Use Node.js version 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose ports for both services
EXPOSE 4000 5173

# Install Deno
RUN npm i deno -g

# Start Node.js/Vite service
RUN yarn dev

# Run both services
CMD ["./start.sh"]