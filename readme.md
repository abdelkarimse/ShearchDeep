# ShearchDeep - AI Copilot Instructions

## Project Overview
ShearchDeep is a full-stack document search and AI summarization platform combining:
- **Backend**: Spring Boot 3.5.8 (Java 17) with LLM integration, Keycloak auth, WebSocket support, and Mayan EDMS connectivity
- **Frontend**: Next.js 16 with NextAuth, Zustand state management, Tailwind CSS
- **Infrastructure**: Docker Compose orchestration (PostgreSQL, Keycloak, Ollama, RabbitMQ, Mayan)

## Architecture & Data Flow

### Backend Architecture (Spring Boot)
- **Controller Layer** (`controller/`): REST endpoints follow pattern `/api/V1/{resource}`
  - `DocumentController`: Document operations (summarize, list from Mayan EDMS)
  - `UserController`, `NotificationController`: User and notification management
- **Service Layer** (`services/`): Service implementations for external integrations
  - `LlmServiceImpl`: AI chat client integration (Ollama) for document summarization; uses `ChatClient` bean from `DeepShearchApplication`
  - `MayanServiceImpl`: Integration with Mayan EDMS for document management
  - Other services follow interface pattern in `services/interfaces/`
- **Data Layer**: JPA entities in `Model/`, repositories inherit from Spring Data JPA
- **DTO Pattern**: Request/Response objects in `Dto/` (e.g., `AiSumarizeResponse`, `MayanDocumentResponse`)

**Key Integration**: LLM service receives document content, processes via Spring AI ChatClient (configured with Ollama), outputs JSON with summary and keywords.

### Authentication & Security
- Keycloak integration via `KeycloakAdminClientConfig` + Spring Security
- CORS enabled for all origins (configured in `application.yml`)
- Custom filter `CustomSecurityFilter` applied after BasicAuthenticationFilter
- Mayan EDMS endpoints permitting all access; other endpoints require authorization

### WebSocket Support
- STOMP endpoint at `/ws` configured in `WebSocketConfig`
- Message broker enables `/user` and `/topic` subscriptions
- Used for real-time notifications (see `NotificationServiceImpl`, `NotificationController`)

### Frontend Architecture (Next.js)
- **Pages**: `app/` directory with layout wrapper (`layout.tsx`), auth provider (`providers.tsx`)
- **Components**: Reusable `Navbar.tsx`, `Sidebar.tsx`; organized by feature (Admin, Client sections)
- **State Management**: Zustand stores (e.g., `themeStore.ts`) using localStorage persistence
- **Authentication**: NextAuth configuration in `app/api/auth/[...nextauth]/route.ts` (currently scaffolded with Google provider placeholder)
- **Styling**: Tailwind CSS with PostCSS

## Build & Deployment

### Backend Build Commands
```bash
# Maven commands (from backend/ directory)
./mvnw clean package          # Build JAR
./mvnw spring-boot:run        # Run locally on :8082 (configured in application.yml)
./mvnw test                   # Run tests
```

### Frontend Build Commands
```bash
# From frontend/ directory
npm run dev                   # Development server (:3000)
npm run build                 # Production build
npm start                     # Serve production build
npm run lint                  # Run ESLint
```

### Docker Orchestration
Run full stack with: `docker-compose up` (from root or `backend/` directory)
- **postgres:15**: Shared database at :5432 (admin/123456)
- **keycloak**: Auth server at :8080
- **backend**: Java app at :8082
- **ollama**: LLM service at :11434 (model: qwen3:1.7b)
- **mayan**: Document management (EDMS)
- **rabbitmq**: Message broker for async operations

## Code Patterns & Conventions

### Java/Spring Conventions
1. **DTOs**: Always use separate request/response DTOs; apply `@Data`, `@AllArgsConstructor`, `@NoArgsConstructor` (Lombok)
2. **Services**: Implement interfaces from `services/interfaces/`; use `@Service` annotation
3. **Dependency Injection**: Constructor-based via `@AllArgsConstructor` or explicit constructors
4. **Logging**: Use `@Slf4j` for structured logging via SLF4J
5. **Response Format**: Return wrapped responses (`ResponseEntity<T>`) or `Mono<T>` for async operations
6. **API Versioning**: All endpoints prefixed with `/api/V1/`

### Frontend Conventions
1. **Components**: Use functional components with TypeScript (`*.tsx`)
2. **State**: Zustand stores placed in `app/Zustand/`; export selector hooks (`useTheme`, `useThemeActions`)
3. **NextAuth**: Integration pattern shown in `app/api/auth/[...nextauth]/route.ts`
4. **Styling**: Tailwind classes directly in JSX (no separate CSS files typically)

### LLM Integration Pattern
- System prompt defined in `DeepShearchApplication` startup
- Chat requests flow through `LlmServiceImpl.generateSummary()`
- Expected response format: JSON with `summary` and `keywords` fields
- Integration via Spring AI's ChatClient abstraction (supports Ollama via configuration)

## Key External Dependencies
- **Mayan EDMS**: Document storage/retrieval via REST API (integration in `MayanServiceImpl`)
- **Keycloak**: Authentication/authorization server
- **Ollama**: Local LLM inference engine
- **RabbitMQ**: Async messaging for notifications/background tasks
- **PostgreSQL**: Persistent storage for application data (entities in `Model/`, DDL auto-update via Hibernate)

## Important Files & Their Roles
- `backend/pom.xml`: Maven dependencies, Spring AI, Keycloak, PostgreSQL
- `backend/src/main/resources/application.yml`: Database, Keycloak, Ollama, MCP client configuration
- `frontend/package.json`: Dependencies, build scripts
- `docker-compose.yml`: Service orchestration, health checks, networking
- `.github/copilot-instructions.md`: This file

## Workflow Considerations
- **Local Development**: Requires Docker Compose for services (DB, Keycloak, Ollama, Mayan)
- **Port Usage**: Backend :8082, Frontend :3000, Keycloak :8080, PostgreSQL :5432, Ollama :11434
- **Environment Variables**: Database credentials, Ollama base-url, JWT issuer-uri set in `application.yml`; override via env vars with `${VAR_NAME:default}` syntax
- **Testing**: Backend tests in `backend/src/test/`; frontend uses ESLint (no Jest config yet)


# ShearchDeep - Docker Startup Scripts

This directory contains multiple startup scripts to run all Docker services on the same network for inter-service communication.

## Available Startup Scripts

### 1. **start-all.bat** (Windows Batch)
For Windows Command Prompt users.

**Usage:**
```cmd
start-all.bat
```

Or double-click the file in Windows Explorer.

---

### 2. **start-all.ps1** (PowerShell)
For Windows PowerShell users with colored output and better formatting.

**Usage:**
```powershell
.\start-all.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run:
```powershell
.\start-all.ps1
```

---

### 3. **start-all.sh** (Bash/Shell)
For Linux and macOS users.

**Usage:**

First, make the script executable:
```bash
chmod +x start-all.sh
```

Then run it:
```bash
./start-all.sh
```

---

## Services Started

All scripts start the following services on the **app-network**:

| Service | Port | Type | Description |
|---------|------|------|-------------|
| **Keycloak** | 8080 | Auth Server | Identity and Access Management |
| **Backend** | 8082 | Spring App | REST API |
| **Ollama** | 11434 | LLM | Language Model Service |
| **Mayan** | 80 | Document Management | Document OCR and Management |

---

## Database Connections

| Database | Port | User | Password |
|----------|------|------|----------|
| Keycloak PostgreSQL | 5432 | kc | kc_password |
| Backend PostgreSQL | 5433 | admin | 123456 |
| Mayan PostgreSQL | Internal | mayan | mayandbpass |

---

## Network Architecture

All services communicate through the **app-network** Docker bridge network, allowing:

- **Keycloak** ↔ **Backend** (Authentication)
- **Backend** ↔ **Ollama** (LLM Integration)
- **Backend** ↔ **Mayan** (Document Management)
- All services can resolve each other by container name

---

## Quick Start

### Windows (Choose one):
```cmd
start-all.bat
```

### PowerShell:
```powershell
.\start-all.ps1
```

### Linux/macOS:
```bash
./start-all.sh
```

---

## Stopping All Services

### Windows:
```cmd
docker compose -f Keyclock/docker-compose.yaml down
docker compose -f backend/docker-compose.yml down
docker compose -f ollama/docker-compose.yml down
docker compose -f mayan/docker-compose.yml -p mayan down
```

### Linux/macOS:
```bash
docker compose -f Keyclock/docker-compose.yaml down
docker compose -f backend/docker-compose.yml down
docker compose -f ollama/docker-compose.yml down
docker compose -f mayan/docker-compose.yml -p mayan down
```

---

## Viewing Logs

### Keycloak:
```bash
docker logs keycloak -f
```

### Backend:
```bash
docker logs spring-app -f
```

### Ollama:
```bash
docker logs ollama -f
```

### Mayan:
```bash
docker logs mayan-app-1 -f
```

---

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error, check what's running:
```bash
docker ps -a
```

Stop specific containers:
```bash
docker stop <container_name>
docker rm <container_name>
```

### Network Issues
Verify containers are on app-network:
```bash
docker network inspect app-network
```

### Service Not Responding
Check service health:
```bash
docker ps --filter "status=running"
```

Check logs:
```bash
docker logs <container_name>
```

---

## Notes

- All services use the same **app-network** for communication
- PostgreSQL databases are accessible from host machine
- Mayan, Ollama, and Keycloak services are automatically connected to app-network
- Services are set to restart unless stopped
- Volumes are preserved between restarts

---

## Docker Commands Reference

```bash
# View all running containers
docker ps

# View container logs
docker logs <container_name> -f

# Stop all services
docker compose down

# Remove volumes (clean start)
docker compose down -v

# Inspect network
docker network inspect app-network

# Check resource usage
docker stats
```

---

Created: December 6, 2025
