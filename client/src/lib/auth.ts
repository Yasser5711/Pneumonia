import { inferAdditionalFields } from 'better-auth/client/plugins'
import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

import type { auth } from '@server/utils/auth'

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<auth>(), customSessionClient<auth>()],
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})
