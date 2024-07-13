FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# compile application
RUN npx tsc

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/index.js"]
