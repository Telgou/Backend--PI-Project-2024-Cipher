# Use official Node.js image as the base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000 (change this if your app listens on a different port)
EXPOSE 3001

# Command to run the application
CMD ["node", "index.js"]
