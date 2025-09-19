# 🔐 Authentication Configuration

This document provides comprehensive information about authentication configuration in the Pneumonia Detection App.

## Overview

The application uses OAuth-based authentication with support for GitHub and Google providers. Authentication is controlled by the `ENABLE_LOCAL_AUTH` environment variable.

## Environment Variables

### `ENABLE_LOCAL_AUTH`

**Type:** `boolean`  
**Default:** `false`  
**Required:** Yes (for authentication to work)

Controls whether OAuth authentication routes are enabled in the API.

#### When `ENABLE_LOCAL_AUTH=false` (Default)
- All OAuth authentication endpoints return `NOT_IMPLEMENTED` errors
- Users cannot log in through GitHub or Google OAuth
- Users cannot log out through the API
- The application essentially runs in "authentication-disabled" mode

#### When `ENABLE_LOCAL_AUTH=true`
- GitHub OAuth login/callback endpoints are active
- Google OAuth login/callback endpoints are active
- User logout endpoint is active
- Users can authenticate and access protected features

### Required OAuth Configuration

When enabling authentication (`ENABLE_LOCAL_AUTH=true`), you must provide the following environment variables:

```bash
# GitHub OAuth Application Settings
GITHUB_CLIENT_ID=your_github_app_client_id
GITHUB_CLIENT_SECRET=your_github_app_client_secret

# Google OAuth Application Settings  
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Session Security
SESSION_SECRET=your_random_session_secret

# Authentication Control
ENABLE_LOCAL_AUTH=true
```

## OAuth Provider Setup

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/auth/github/callback` (development)
4. Copy the Client ID and Client Secret

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI to: `http://localhost:3000/auth/google/callback` (development)
6. Copy the Client ID and Client Secret

## Authentication Flow

### GitHub OAuth Flow
1. **Start:** `GET /api/auth/github/login`
   - Returns a redirect URL to GitHub's authorization page
2. **Callback:** `GET /api/auth/github/callback?code=...&state=...`
   - Exchanges authorization code for access token
   - Fetches user profile and email from GitHub API
   - Creates or updates user in database
   - Generates API key for the user
   - Sets session cookie
   - Returns API key

### Google OAuth Flow
1. **Start:** `GET /api/auth/google/login`
   - Returns a redirect URL to Google's authorization page
2. **Callback:** `GET /api/auth/google/callback?code=...&state=...`
   - Exchanges authorization code for access token
   - Fetches user profile from Google API
   - Creates or updates user in database
   - Generates API key for the user
   - Sets session cookie
   - Returns API key

### User Management
- **Get User Info:** `GET /api/user/me`
  - Returns current user information and quota
- **Logout:** `POST /api/user/logout`
  - Clears session cookie
  - Returns success confirmation
- **Generate API Key:** `POST /api/user/generate-key`
  - Generates a new API key for the authenticated user

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Requires ENABLE_LOCAL_AUTH |
|--------|----------|-------------|---------------------------|
| `GET` | `/api/auth/github/login` | Initiate GitHub OAuth | ✅ |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback | ✅ |
| `GET` | `/api/auth/google/login` | Initiate Google OAuth | ✅ |
| `GET` | `/api/auth/google/callback` | Google OAuth callback | ✅ |

### User Endpoints

| Method | Endpoint | Description | Requires ENABLE_LOCAL_AUTH |
|--------|----------|-------------|---------------------------|
| `GET` | `/api/user/me` | Get current user info | ❌ |
| `POST` | `/api/user/logout` | Logout user | ✅ |
| `POST` | `/api/user/generate-key` | Generate new API key | ❌ |

## Error Handling

When `ENABLE_LOCAL_AUTH=false`, authentication endpoints return:

```json
{
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "GitHub authentication is currently disabled."
  }
}
```

or

```json
{
  "error": {
    "code": "NOT_IMPLEMENTED", 
    "message": "Google authentication is currently disabled."
  }
}
```

or

```json
{
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "Router is currently disabled."
  }
}
```

## Development vs Production

### Development Environment
```bash
ENABLE_LOCAL_AUTH=true
GITHUB_CLIENT_ID=your_dev_github_client_id
GITHUB_CLIENT_SECRET=your_dev_github_client_secret
GOOGLE_CLIENT_ID=your_dev_google_client_id
GOOGLE_CLIENT_SECRET=your_dev_google_client_secret
SESSION_SECRET=dev_session_secret_at_least_32_chars
BASE_URL=http://localhost:3000
```

### Production Environment
```bash
ENABLE_LOCAL_AUTH=true
GITHUB_CLIENT_ID=your_prod_github_client_id
GITHUB_CLIENT_SECRET=your_prod_github_client_secret
GOOGLE_CLIENT_ID=your_prod_google_client_id
GOOGLE_CLIENT_SECRET=your_prod_google_client_secret
SESSION_SECRET=secure_random_production_secret
BASE_URL=https://yourdomain.com
```

**Important:** Use different OAuth applications for development and production environments for security.

## Security Considerations

1. **Session Secret:** Use a cryptographically secure random string of at least 32 characters
2. **OAuth Applications:** Configure separate OAuth apps for each environment
3. **Redirect URLs:** Ensure redirect URLs match your application's domain exactly
4. **Environment Variables:** Never commit secrets to version control
5. **HTTPS:** Always use HTTPS in production for OAuth callbacks

## Troubleshooting

### Common Issues

1. **"Authentication is currently disabled" errors**
   - Check that `ENABLE_LOCAL_AUTH=true`
   - Verify environment variables are properly loaded

2. **OAuth callback failures**
   - Verify OAuth application redirect URLs match your server configuration
   - Check that client IDs and secrets are correct
   - Ensure the OAuth application is active

3. **Session issues**
   - Verify `SESSION_SECRET` is set and consistent
   - Check cookie settings in browser developer tools

### Testing Authentication

Use the test endpoints to verify configuration:

```bash
# Test GitHub OAuth start
curl http://localhost:3000/api/auth/github/login

# Test Google OAuth start  
curl http://localhost:3000/api/auth/google/login

# Test user info (requires authentication)
curl -H "X-API-KEY: your_api_key" http://localhost:3000/api/user/me
```