# Use official Node.js 18 image as base
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
