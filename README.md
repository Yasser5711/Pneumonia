<h1 align="center">🫁 Pneumonia Detection App</h1>

<p align="center">An AI-powered web application for detecting pneumonia from chest X-rays 💡</p>

---

## 🚀 Getting Started

To start the project with **Docker Compose**, run:

```bash
docker-compose --profile front --profile back --env-file .env up -d
```

### Environment variables

```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
ENABLE_LOCAL_AUTH=true
```

For detailed environment variable documentation, see [Environment Configuration](#environment-configuration).

## 📦 Tech Stack

- 🖥️ Vue 3 + Vite + TypeScript
- 🎨 TailwindCSS + Vuetify
- 🧪 Vitest for Testing
- 🔬 tRPC + Fastify for Backend
- 🧠 Modelbit for AI Prediction
- 🐳 Dockerized Frontend & Backend

## 🛠️ Features

- 🔍 Upload chest X-ray images
- 🤖 AI-based pneumonia prediction
- 💬 Real-time assistant feedback
- 🌓 Light/Dark theme toggle
- 📊 Code quality checks & CI

## 🔐 Secrets and Actions

- Please refer to [`workflows/SECRETS.md`](./.github/workflows/SECRETS.md) for GitHub Action secrets documentation.

## ⚙️ Environment Configuration

### Authentication Settings

#### `ENABLE_LOCAL_AUTH`
**Type:** `boolean` | **Default:** `false`

Controls whether OAuth authentication routes are enabled in the API. When set to `false`, all OAuth authentication endpoints will return a "NOT_IMPLEMENTED" error.

**What it controls:**
- GitHub OAuth login (`/auth/github/login`, `/auth/github/callback`)
- Google OAuth login (`/auth/google/login`, `/auth/google/callback`)  
- User logout endpoint (`/user/logout`)

**Usage:**
```bash
# Enable authentication (development/production)
ENABLE_LOCAL_AUTH=true

# Disable authentication (default)
ENABLE_LOCAL_AUTH=false
```

**Note:** Despite the name suggesting "local auth", this variable actually controls OAuth providers (GitHub, Google). When disabled, users cannot log in or log out through the API.

For complete authentication setup and configuration details, see [Authentication Configuration](./docs/AUTHENTICATION.md).

### Required OAuth Configuration

When `ENABLE_LOCAL_AUTH=true`, you must also provide:

```bash
GITHUB_CLIENT_ID=your_github_app_client_id
GITHUB_CLIENT_SECRET=your_github_app_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
SESSION_SECRET=your_random_session_secret
```

### Other Environment Variables

For complete environment variable documentation including deployment secrets, see [`.env.template`](./.env.template) and [`workflows/SECRETS.md`](./.github/workflows/SECRETS.md).

## 🧑‍💻 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before creating commits or Pull Requests.
