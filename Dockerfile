# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app
# Copy the pom.xml first
COPY backend/pom.xml ./backend/
# Copy the backend source
COPY backend/src ./backend/src/
# Copy the built frontend static files into Spring Boot's static folder
COPY --from=frontend-build /app/dist ./backend/src/main/resources/static/
# Build the jar
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 3: Run the Spring Boot application containing both
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/api-1.0.0.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
