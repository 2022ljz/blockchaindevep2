FROM node:18-alpine as build

WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_NETWORK_ID
ARG REACT_APP_LOTTERY_CONTRACT
ARG REACT_APP_DICE_CONTRACT

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_NETWORK_ID=$REACT_APP_NETWORK_ID
ENV REACT_APP_LOTTERY_CONTRACT=$REACT_APP_LOTTERY_CONTRACT
ENV REACT_APP_DICE_CONTRACT=$REACT_APP_DICE_CONTRACT

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY public/ ./public/
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
