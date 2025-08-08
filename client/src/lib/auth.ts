import { inferAdditionalFields } from 'better-auth/client/plugins'
import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

import type { Auth } from '@server/utils/auth'

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>(), customSessionClient<Auth>()],
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})
