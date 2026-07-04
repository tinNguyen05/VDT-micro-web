# Stage 1: Build ứng dụng ReactJS
FROM node:18-alpine as builder
WORKDIR /app
# Copy package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install
# Copy toàn bộ source code và tiến hành build
COPY . .
RUN npm run build 
# LƯU Ý: Nếu em dùng Vite thay vì Create React App, hãy đổi chữ 'build' ở trên thành 'dist'

# Stage 2: Phục vụ file tĩnh bằng NGINX (Chuẩn Enterprise)
FROM nginx:alpine
# Copy file đã build từ Stage 1 sang thư mục html của Nginx
COPY --from=builder /app/build /usr/share/nginx/html 
# LƯU Ý: Đổi '/app/build' thành '/app/dist' nếu em dùng Vite

# Expose port 80 cho Nginx
EXPOSE 80

# Chạy Nginx ở foreground
CMD ["nginx", "-g", "daemon off;"]