# Using an official node image from Docker Hub
FROM node:22-alpine

# Setting the working directory inside the container
WORKDIR /app
# copying the all those files starting with package into the container
COPY package*.json ./
# installing the dependecies
RUN npm install
# copying all the files present in the backend
COPY . .
# exposing the port 5000
EXPOSE 5000
# running the dev server
CMD ["npm","run","dev"]