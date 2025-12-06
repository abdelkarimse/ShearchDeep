# -----------------------------
# 1) Build Next.js Static Files
# -----------------------------
FROM node:20 AS builder
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --verbose
RUN npm rebuild lightningcss

COPY . .
RUN npm run build
RUN npm run export   # This generates the out/ folder (static)

# -----------------------------
# 2) Production image with NGINX
# -----------------------------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default NGINX static file config
RUN rm -rf ./*

# Copy static export from builder
COPY --from=builder /app/out ./ 

# Custom NGINX config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
