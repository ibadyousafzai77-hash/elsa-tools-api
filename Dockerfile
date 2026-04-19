# Node 20 use karein taake 'File is not defined' wala error khatam ho jaye
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Port expose karein
EXPOSE 7860

# App chala dein
CMD ["node", "index.js"]
