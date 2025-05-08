# 🔐 GitHub Actions Secrets Management

This document lists and explains the required GitHub Secrets for CI/CD workflows in this repository.

---

## ✅ Secrets List

| Secret Name               | Purpose                                                                                            | Scope  | Who Should Know        |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ------ | ---------------------- |
| `GITHUB_TOKEN`            | Auto-provided by GitHub. Used for basic CI/CD operations, commits, PR comments, deployments.       | Auto   | GitHub Actions Bot     |
| `GH_PAT`                  | Personal Access Token used for creating/updating Pull Requests (when `GITHUB_TOKEN` isn't enough). | Manual | Repo Admins            |
| `NETLIFY_AUTH_TOKEN`      | Auth token for deploying frontend to Netlify.                                                      | Manual | DevOps / Admins        |
| `NETLIFY_PROD_SITE_ID`    | Netlify site ID for **production** frontend deployments.                                           | Manual | DevOps / Admins        |
| `NETLIFY_STAGING_SITE_ID` | Netlify site ID for **staging** frontend deployments.                                              | Manual | DevOps / Admins        |
| `VITE_API_URL_PROD`       | API base URL used in frontend production builds.                                                   | Manual | Frontend Devs          |
| `VITE_API_KEY_PROD`       | API key used by frontend in production to access secure APIs.                                      | Manual | Frontend Devs          |
| `VITE_API_URL_STAG`       | API base URL used in frontend staging builds.                                                      | Manual | Frontend Devs          |
| `VITE_API_KEY_STAG`       | API key used by frontend in staging to access APIs securely.                                       | Manual | Frontend Devs          |
| `DOCKER_USERNAME`         | Docker Hub username for pushing backend images (prod/staging).                                     | Manual | DevOps                 |
| `DOCKER_PASSWORD`         | Docker Hub password/token for pushing backend images.                                              | Manual | DevOps                 |
| `RENDER_DEPLOY_HOOK_PROD` | Render webhook URL to trigger backend **production** deploys.                                      | Manual | DevOps                 |
| `RENDER_DEPLOY_HOOK_STAG` | Render webhook URL to trigger backend **staging** deploys.                                         | Manual | DevOps                 |
| `DATABASE_URL_PROD_MIG`   | Full DB connection string used for running **prod** migrations.                                    | Manual | Backend Devs / DevOps  |
| `DATABASE_URL_STAG_MIG`   | Full DB connection string used for running **staging** migrations.                                 | Manual | Backend Devs / DevOps  |
| `SERVER_STAGING_URL`      | URL of deployed backend staging server (used in PR comments).                                      | Manual | All Developers         |
| `PANEL_USER`              | Basic auth username for accessing `/panel` or `/reference` in non-dev environments.                | Manual | Admins / Backend Leads |
| `PANEL_PASS`              | Basic auth password for protected endpoints.                                                       | Manual | Admins / Backend Leads |

---

## 📋 Notes

- **`GH_PAT`** should have minimal required scopes:
  - `repo`
  - `workflow`
  - **Never use your personal PAT in shared environments**.
- **API keys (`VITE_API_KEY_*`)** are embedded at build time — keep them secure and rotate periodically.
- Secrets like **Docker/Netlify tokens** must be limited to CI only and rotated quarterly.
- **Render deploy hooks** are secret URLs and must be treated as tokens — never expose in logs or comments.
- **Basic auth for internal routes** (`PANEL_USER`, `PANEL_PASS`) is used to protect sensitive debug/admin views.

---

## 🛡️ Best Practices

- **Never hardcode secrets** in workflows or source files.
- Use `workflow_call` + environments to scope secrets per job (`staging`, `production`).
- Rotate **all manually generated secrets** (PATs, tokens, DB creds) every 90 days.
- Use GitHub **environments with required reviewers** for high-risk deploys.
- Keep different secrets per environment (`PROD`, `STAG`) to prevent leakage/collision.
- Restrict Netlify/Docker tokens to least-privilege org/team/service accounts where possible.

---

_This list should be updated any time a new CI job or deployment target is added._
