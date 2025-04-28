# 🔐 GitHub Actions Secrets Management

This document lists and explains the required GitHub Secrets for CI/CD workflows in this repository.

## ✅ Secrets List

| Secret Name               | Purpose                                                                                             | Scope  | Who Should Know     |
| :------------------------ | :-------------------------------------------------------------------------------------------------- | :----- | :------------------ |
| `GITHUB_TOKEN`            | Auto-provided by GitHub. Used for basic CI/CD operations.                                           | Auto   | GitHub Actions Bot  |
| `GH_PAT`                  | Personal Access Token used for creating/updating Pull Requests (when `GITHUB_TOKEN` is not enough). | Manual | Only repo admins    |
| `NETLIFY_AUTH_TOKEN`      | Authentication token for deploying frontend to Netlify.                                             | Manual | DevOps, Admins      |
| `NETLIFY_PROD_SITE_ID`    | Production Site ID for Netlify deploys.                                                             | Manual | DevOps, Admins      |
| `DOCKER_USERNAME`         | Docker Hub username for pushing backend images.                                                     | Manual | DevOps, Admins      |
| `DOCKER_PASSWORD`         | Docker Hub password for pushing backend images.                                                     | Manual | DevOps, Admins      |
| `RENDER_DEPLOY_HOOK_PROD` | Render deployment hook for backend production server.                                               | Manual | DevOps, Admins      |
| `VITE_API_URL_PROD`       | API base URL for frontend production environment.                                                   | Manual | Frontend Developers |
| `VITE_API_KEY_PROD`       | API key for accessing production APIs securely from frontend.                                       | Manual | Frontend Developers |
| `SERVER_STAGING_URL`      | URL for backend staging server (used in PR comments).                                               | Manual | Developers          |

---

## 📋 Notes

- **GH_PAT** should have minimal required scopes:
  - `repo`
  - `workflow`
- Tokens like **NETLIFY_AUTH_TOKEN**, **DOCKER_PASSWORD**, and **RENDER_DEPLOY_HOOK_PROD** must **never** be shared outside of trusted team members.
- **GITHUB_TOKEN** is auto-managed by GitHub but needs `permissions: write` in workflows to push branches/tags.
- Rotate Personal Access Tokens (like `GH_PAT`) every **90 days** as a security best practice.
- **Always** use GitHub Secrets, **never** hardcode tokens inside workflows.

---

## 🛡️ Best Practices

- Audit secrets regularly.
- Use least privilege principle: **only give secrets to workflows that need them**.
- If secrets are leaked or compromised, rotate them immediately.
- Use GitHub environments + required approvals for critical secrets (optional for advanced workflows).

---
