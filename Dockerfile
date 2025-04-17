# Use Node.js version 20 as base image
FROM denoland/deno

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json deno.json deno.lock ./

# Install dependencies
RUN deno install

# Copy the rest of the application
COPY . .

# Patch Apollo server
RUN deno task patch-server

# Expose ports for both services
EXPOSE 4000

# Run both services
CMD ["task", "dev"]