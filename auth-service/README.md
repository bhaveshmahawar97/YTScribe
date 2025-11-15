# Auth Service (Spring Boot 3 + MongoDB + JWT + OAuth2)

This service provides authentication and authorization for a SPA frontend and future NodeJS backend services.

## Tech Stack
- Spring Boot 3.x
- Spring Security + OAuth2 Client
- Spring Data MongoDB
- JWT (JJWT)
- BCrypt password hashing
- Bucket4j rate limiting (in-memory example)
- Jakarta Validation
- SMTP email stub (verification & reset)
- Springdoc OpenAPI (Swagger UI)

## Environment Variables
- `MONGODB_URI`
- `JWT_SECRET` (or `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` if you later switch to RSA)
- `JWT_ACCESS_TOKEN_EXPIRATION` (seconds, default `900`)
- `JWT_REFRESH_TOKEN_EXPIRATION` (seconds, default `2592000`)
- `OAUTH2_GOOGLE_CLIENT_ID`
- `OAUTH2_GOOGLE_CLIENT_SECRET`
- `OAUTH2_GITHUB_CLIENT_ID`
- `OAUTH2_GITHUB_CLIENT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `APP_BASE_URL` (e.g. `http://localhost:3000` for SPA)
- `RATE_LIMIT_CONFIG` (optional, see `app.rate-limit` section in `application.yml`)

## OAuth2 Setup

Configure OAuth apps with the following callback URIs:
- Google redirect URI: `http://localhost:8081/oauth2/callback/google`
- GitHub redirect URI: `http://localhost:8081/oauth2/callback/github`

The SPA should redirect the browser to:
- `http://localhost:8081/oauth2/authorization/google`
- `http://localhost:8081/oauth2/authorization/github`

After successful login, the backend redirects to:
- `${APP_BASE_URL}/oauth2/redirect?accessToken=...&refreshToken=...&expiresIn=...`

## REST Endpoints (Overview)

- `POST /api/auth/signup`
- `GET  /api/auth/verify?token=...`
- `POST /api/auth/signin`
- `POST /api/auth/refresh`
- `POST /api/auth/signout`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`
- `GET  /api/admin/users` (ROLE_ADMIN)
- `GET  /api/user/me`
- `GET  /api/auth/introspect` (optional token introspection)

Swagger UI: `http://localhost:8081/swagger-ui/index.html`

### Example Postman Payloads

- **Signup** `POST /api/auth/signup`

  ```json
  {
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Passw0rd!"
  }
  ```

- **Signin** `POST /api/auth/signin`

  ```json
  {
    "email": "test@example.com",
    "password": "Passw0rd!"
  }
  ```

- **Refresh** `POST /api/auth/refresh`

  ```json
  {
    "refreshToken": "<refresh-token-from-signin>"
  }
  ```

- **Password Reset Request** `POST /api/auth/password/forgot`

  ```json
  {
    "email": "test@example.com"
  }
  ```

- **Password Reset** `POST /api/auth/password/reset`

  ```json
  {
    "token": "<reset-token-from-email>",
    "newPassword": "NewPassw0rd!"
  }
  ```

- **Verify Email** `GET /api/auth/verify?token=<verification-token>`

- **OAuth2**
  - Start: `GET /oauth2/authorization/google` or `GET /oauth2/authorization/github`
  - Callback: `/oauth2/callback/google` or `/oauth2/callback/github`
  - Final redirect to SPA: `${APP_BASE_URL}/oauth2/redirect?accessToken=...&refreshToken=...&expiresIn=...`

## CSRF & Security Notes

- This API is designed for SPA clients using the `Authorization: Bearer <token>` header.
- CSRF protection is disabled for the stateless API. If you later use cookies, enable CSRF with double-submit or same-site cookie strategy.
- Always deploy behind HTTPS and set `Secure` + `HttpOnly` flags on cookies if using cookie transport.

## Running Locally

```bash
mvn spring-boot:run
```

## OAuth with ngrok

When testing OAuth callbacks from Google/GitHub, expose the backend using ngrok:

```bash
ngrok http 8081
```

Use the ngrok HTTPS URL as the base for your OAuth redirect URIs, e.g.:
- `https://<random>.ngrok.io/oauth2/callback/google`
- `https://<random>.ngrok.io/oauth2/callback/github`

Then set `APP_BASE_URL` to your SPA URL (local or remote) so the success handler can redirect with tokens.

## Envoy / Nginx Notes

Terminate TLS at Envoy/Nginx and forward the `Authorization` header and `X-Forwarded-*` headers. Example:
- Preserve `Authorization` so JWTs reach the service.
- Set `X-Forwarded-Proto=https` and `X-Forwarded-For`.
- Ensure websockets or HTTP/2 upgrades are allowed if your SPA uses them.

Rate limiting can also be enforced at the gateway (recommended) in addition to local Bucket4j limits on sensitive auth endpoints.

## NodeJS Integration Notes

- **Token format**: JWT with HS256 signature using the shared `JWT_SECRET`.
- **Validation in Node**: use a JWT library (e.g., `jsonwebtoken`) with the same secret and algorithms to validate `accessToken`.
- **Microservice pattern**: treat this Spring Boot service as the central issuer; other services (Node or Java) only validate tokens.
- **Token introspection**: `GET /api/auth/introspect?token=<access-or-refresh-token>` returns `active` flag, `userId`, `email`, and `roles`.
- **CORS**: configure SPA origin via `app.cors.allowed-origins` in `application.yml` so that both Spring and any Node gateway expose consistent CORS headers.
