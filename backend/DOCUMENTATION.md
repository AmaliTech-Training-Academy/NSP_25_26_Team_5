##### CommunityBoard

### AmaliTech Group Project – Full-Stack Teams (Teams 1-5)

A community notice board where users can post announcements, events, and discussions. Supports categories, 
comments, search, image uploads, and analytics dashboards.

### Tech Stack
Backend: Java 17 + Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, PostgreSQL
Frontend: React 18, React Router, Axios, Chart.js
Data Engineering: Python ETL pipeline, analytics aggregation
QA: REST Assured (API), Selenium WebDriver (UI)
DevOps: Docker, docker-compose, GitHub Actions CI

### Project Structure

NSP_25_26_Team_5/
├── backend/                     # Spring Boot REST API
│   ├── src/main/java/com/amalitech/communityboard/
│   │   ├── config/              # Security & app configs
│   │   ├── controller/          # REST controllers (Post, Image, Analytics)
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── exception/           # Custom exceptions
│   │   ├── model/               # Entities (Post, User, Category, Comment)
│   │   │   └── enums/           # Enum definitions (Role, etc.)
│   │   ├── repository/          # JPA repositories
│   │   └── service/             # Business logic (PostService, ImageStorageService, AnalyticsService)
│   ├── resources/               # application.yml, schema.sql, data.sql
│   ├── Dockerfile               # Backend Dockerfile
│   └── target/                  # Build output
├── frontend/                    # React 18 SPA
├── data-engineering/            # Python ETL & analytics
├── qa/                          # API & UI test suites
├── devops/                      # Docker, CI/CD configs
└── .github/workflows/           # GitHub Actions pipelines

### Features Implemented
.User authentication (register/login with JWT)
.Basic post CRUD (create, read, update, delete)
.Category management
Image upload attached to posts (POST /api/posts/{postId}/image)
.Analytics dashboard (GET /api/analytics/dashboard)
.Dockerized backend, frontend, and database
.Swagger API documentation

Comments system (in progress)
Search & filtering (in progress)
Notifications (in progress)
User profiles (in progress)

### Default Users (seeded)
Email	            Password	            Role
admin@amalitech.com	password123	            ADMIN
user@amalitech.com	password123	            USER
### Commands & Workflows
Git Workflow
bash
### Fetch and checkout feature branch
git fetch origin
git checkout -b ft/authentication origin/ft/authentication

### Commit changes
git add .
git commit -m "feat: attach image to post"

### Push branch
git push origin ft/authentication

### Docker Workflow

### Build and start containers
docker-compose up --build

### Check running containers
docker ps

### 1. Connect to the PostgreSQL Database

# Use the docker exec command to access your database:
docker exec -it <postgres_container_name> psql -U postgres -d communityboard

# Example:
docker exec -it nsp_25_26_team_5-postgres-1 psql -U postgres -d communityboard
-it → run the container in interactive mode.

<postgres_container_name> → replace with the name or ID of your PostgreSQL container (docker ps to find it).
-U postgres → login as the postgres user.
-d communityboard → connect to the communityboard database.

After running this command, you will see the PostgreSQL prompt:

communityboard=#

### 2. List All Tables

To view all tables in the database:

\dt
### 3. Query Table Data

To view data from a specific table (e.g., posts), use:

SELECT * FROM posts LIMIT 5;

LIMIT 5 shows the first 5 rows of the table.
Always end SQL statements with a semicolon (;).

 ### 4. Describe Table Structure (Optional)

To inspect the structure of a table:

\d posts

This shows column names, data types, and constraints.

###  5. Exit PostgreSQL

To exit the PostgreSQL prompt:

\q

### Swagger
Run backend  & stop (docker-compose up & docker-compose down).

###Open Swagger UI:
http://localhost:8080/swagger-ui/index.html

### Test endpoints:
POST /api/posts
POST /api/posts/{postId}/image
GET /api/analytics/dashboard