<h1 align="center">🫁 Pneumonia Detection App</h1>

<p align="center">An AI-powered web application for detecting pneumonia from chest X-rays 💡</p>

---

## 🚀 Getting Started

To start the project with **Docker Compose**, run:

```bash
docker-compose --profile front --profile back --env-file .env up -d
```

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

## 📦 Release Process

- The release process is managed using [Changesets](./RELEASE.md).
- Follow the steps described in [RELEASE.md](./RELEASE.md) to generate and publish new releases.

## 🔐 Secrets and Actions

- Please refer to [`workflows/SECRETS.md`](./.github/workflows/SECRETS.md) for GitHub Action secrets documentation.

## 🧑‍💻 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before creating commits or Pull Requests.
