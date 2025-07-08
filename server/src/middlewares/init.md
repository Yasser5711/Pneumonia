we can have a flexibleMiddleware

```ts
export const flexibleAuth = t.middleware(async ({ ctx, next }) => {
  const session = getSession(ctx.req); // cookie → utilisateur
  const apiKey = ctx.apiKey?.trim(); // header  → guest ou usage technique

  // 1. Session d’abord
  if (session) {
    const user = await ctx.services.userService.findById(session.sub);
    if (user) {
      return next({ ctx: { ...ctx, authType: 'user', user } });
    }
  }

  // 2. Sinon clé API
  if (apiKey) {
    const record = await ctx.services.apiKeyService.validateKey(apiKey);
    await ctx.services.apiKeyService.markKeyUsed({ id: record.id, ip: ctx.req.ip });
    return next({ ctx: { ...ctx, authType: 'apiKey', apiKeyRecord: record } });
  }

  // 3. Rien ? → 401
  throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
});
```

block client when pass api-key that already have user like check before making request with guest client
