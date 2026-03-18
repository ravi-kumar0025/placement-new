#  Stage 1 : BUild
FROM node:22-alpine AS builder 
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# Build the production bundle (output to the /app/dist)
RUN npm run build 

# Stage 2: SERVE --
#  using nginx cuz it is lightweight and fast to serve the already built files
FROM nginx:alpine
# grabs only the built files from the stage 1 and ignores all the node_modules
COPY --from=builder /app/dist/ /usr/share/nginx/html

# copy the custom made nginx config file 
COPY nginx.conf /etc/nginx/conf.d/default.conf

# NGINX default port 
EXPOSE 80
# nginx starts automatically no CMD needed

