# 1. Use an official Node.js runtime as a parent image
# Alpine is used for its small size (Security & Efficiency)
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (to leverage Docker caching)
COPY package*.json ./

# 4. Install dependencies
# 'npm ci' is faster and more reliable than 'npm install' for production builds
RUN npm ci

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port your app runs on
EXPOSE 8001

# 7. Define the command to run your app
# Using node directly is better for signal handling than npm start in some cases,
# but npm start works if your package.json scripts are correct.
CMD ["npm", "start"]