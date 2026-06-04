# 1. Start with a lightweight Node image
FROM node:18-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the React code
COPY . .

# 5. Expose the Vite port
EXPOSE 5173

# 6. Start the Vite development server and expose it to the local network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# 1. Start with a lightweight Node image
FROM node:18-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the React code
COPY . .

# 5. Expose the Vite port
EXPOSE 5173

# 6. Start the Vite development server and expose it to the local network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]