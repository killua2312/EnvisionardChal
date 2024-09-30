# Dynamic Surge Pricing System

This project implements a dynamic surge pricing system for a food delivery platform using Node.js, React, PostgreSQL, and Redis.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- Redis
- Git

## System Setup

### PostgreSQL Setup

1. Install PostgreSQL if you haven't already.
2. Log in to PostgreSQL as the superuser:

   ```
   sudo -u postgres psql
   ```

3. Create a new database:

   ```sql
   CREATE DATABASE surge_pricing;
   ```

4. Create a new user:

   ```sql
   CREATE USER surge_user WITH ENCRYPTED PASSWORD 'your_password';
   ```

5. Grant privileges to the new user:

   ```sql
   GRANT ALL PRIVILEGES ON DATABASE surge_pricing TO surge_user;
   ```

6. Exit PostgreSQL:

   ```
   \q
   ```

### Redis Setup

1. Install Redis:
   - For macOS (using Homebrew):
     ```
     brew install redis
     ```
   - For Windows:
     Download and install Redis from the official website: https://redis.io/download
   - For Linux:
     Use your distribution's package manager. For example, on Ubuntu:
     ```
     sudo apt-get install redis-server
     ```

2. Start the Redis server:
   - For macOS and Linux:
     ```
     redis-server
     ```
   - For Windows:
     Run the `redis-server.exe` file from the installation directory

3. Verify Redis is running:
   ```
   redis-cli ping
   ```
   If Redis is running correctly, it should return "PONG".

## Project Setup

1. Clone the project:

   ```
   git clone https://github.com/killua2312/dynamic-surge-pricing.git
   cd dynamic-surge-pricing
   ```

2. Backend Setup:

   ```
   cd Backend
   npm install
   ```

   Create a `.env` file in the Backend directory with the following variables:

   ```
   PORT=3000
   POSTGRE_DB=surge_pricing
   POSTGRE_USER=surge_user
   POSTGRE_PASS=your_password
   POSTGRE_PORT=5432
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   OPENWEATHER_API_KEY=Rapid_api_key
   ```

   Start the server:

   ```
   node server.js
   ```

3. Frontend Setup:

   ```
   cd ../frontend
   npm install
   npm run dev
   ```

## API Documentation

The API documentation is available via Swagger UI. To access it:

1. Start the backend server.
2. Open a web browser and navigate to `http://localhost:3000/api-docs`.

## API Endpoints

Here are the main API endpoints:

- `/api/auth`: Authentication routes (login, signup)
- `/api/drivers`: Driver management routes
- `/api/orders`: Order management routes
- `/api/surge-pricing`: Surge pricing calculation routes

For detailed information on each endpoint, please refer to the Swagger UI documentation.

## Additional Information

- The backend uses Socket.IO for real-time updates. Make sure your client is configured to connect to the WebSocket server.
- The frontend is built with React and uses Vite as the build tool.
- The project uses JWT for authentication. Make sure to include the JWT token in the Authorization header for protected routes.
- The surge pricing algorithm takes into account factors such as driver availability, order demand, and weather conditions.

