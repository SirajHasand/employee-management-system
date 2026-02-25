# Docker Instructions for Employee Management System

## Prerequisites
- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Building and Running the Application

### Option 1: Using Docker Compose (Recommended)

1. Make sure you have Docker running on your machine
2. Open a terminal/command prompt and navigate to your project directory
3. Run the following command to build and start the application:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

To stop the application, press `Ctrl+C` in the terminal.

To run in detached mode (background):
```bash
docker-compose up --build -d
```

To stop detached containers:
```bash
docker-compose down
```

### Option 2: Building and Running Individual Container

1. Build the Docker image:
```bash
docker build -t employee-management-app .
```

2. Run the container (you'll need a separate PostgreSQL instance):
```bash
docker run -p 3000:3000 employee-management-app
```

## Database Migration

Since this application uses PostgreSQL, you might need to run your schema after the database starts. The application expects a PostgreSQL database with the credentials configured in the docker-compose.yml file.

## Environment Variables

The docker-compose.yml file sets up the necessary environment variables for the application to connect to the PostgreSQL database.

## Notes

- The application will be accessible at `http://localhost:3000`
- The PostgreSQL database will be available at `localhost:5432` with the database name `employee_db`
- Data will persist between container restarts thanks to the named volume


# 🐳 Docker Compose Important Commands

## 🚀 docker compose up
Starts all services defined in `docker-compose.yml`.

## 🚀 docker compose up -d
Starts all services in background (detached mode).

## 🔨 docker compose up --build
Rebuilds images and starts containers.

## 🛑 docker compose stop
Stops running containers without removing them.

## ❌ docker compose down
Stops and removes containers (keeps volumes).

## 💣 docker compose down -v
Stops and removes containers and volumes (deletes database data).

## 📋 docker compose ps
Shows status of running services.

## 📜 docker compose logs
Displays logs of all services.

## 📜 docker compose logs -f
Shows live updating logs.

## 📜 docker compose logs app
Shows logs only for the `app` service.

## 🔄 docker compose restart
Restarts all services.

## 🔄 docker compose restart app
Restarts only the `app` service.

## 🐚 docker compose exec app sh
Opens terminal inside the `app` container.

## 🐚 docker compose exec postgres sh
Opens terminal inside the `postgres` container.

## 🗄 docker volume ls
Lists all Docker volumes.

## 🧹 docker system prune
Removes unused containers, images, and networks.

