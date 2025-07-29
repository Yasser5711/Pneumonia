import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { env } from '../../env';
import { protectedUserProcedure, protectedProcedure, router } from '../../middlewares';
import { clearSession } from '../../utils/session';
export const userRouter = router({
  me: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/user/me',
        tags: ['auth'],
        summary: 'Get current user information',
      },
    })
    .input(z.object({}))
    .output(
      z.object({
        user: z.any(),
        // keys: z.array(z.any()),
        quota: z.object({ used: z.number(), total: z.number() }),
      }),
    )
    .query(async ({ ctx }) => {
      const res = await ctx.services.newUserService.getMe(ctx.userId);
      return res;
    }),
  logout: protectedUserProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user/logout',
        tags: ['auth'],
        summary: 'Logout user',
      },
    })
    .input(z.object({}))
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(({ ctx }) => {
      if (!env.ENABLE_LOCAL_AUTH) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Router is currently disabled.',
        });
      }
      clearSession(ctx.res);
      return { success: true };
    }),
  generateMyKey: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user/generate-key',
        tags: ['key'],
        summary: 'Generate API key for user',
      },
    })
    .input(z.object({}))
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx }) => {
      const { key } = await ctx.services.newApiKeyService.generateKey({
        userId: ctx.userId,
      });
      return { apiKey: key };
    }),
});
/**
 * ChatGPT a dit :

Réflexion durant 1m 41s
L'utilisateur rencontre une erreur "Clé API invalide" après le rafraîchissement, malgré un bon premier pas. Les logs indiquent que la requête fonctionne initialement, mais le problème semble venir de la méthode newApiKeyService.verifyKey. Peut-être qu'il manque une clé ou que celle-ci a expiré, alors qu'un middleware nécessite une clé valide. Lors d'un appel /trpc/auth.user.me, ils utilisent un protectedProcedure qui dépend des cookies de session, tandis qu'une clé API est attendue ailleurs. Je pense que le problème réside dans cette incohérence des processus d'autorisation.

L'utilisateur rencontre une erreur de clé API après un rafraîchissement. Lors du premier appel à /trpc/auth.user.me, la clé API fonctionne et la session existe. Cependant, lors du second appel après le rafraîchissement, il semble que la session ait été supprimée, dépassant ainsi la logique d'autorisation par session. Je pense que l'erreur "Clé API invalide" provient peut-être de newApiKeyService.verifyKey, qui est utilisé dans certains autres processus, mais ne devrait pas affecter ce point particulier où la session est censée suffire.

L'erreur semble survenir après un rafraîchissement, probablement à cause de l'ancienne clé API toujours envoyée par le frontend, bien que la nouvelle clé ait été générée lors de la première requête. Le problème survient probablement parce que newApiKeyService.generateKey désactive toutes les clés précédentes avant de générer une nouvelle clé. Cependant, le frontend continue d'utiliser l'ancienne clé, ce qui entraîne une erreur "Clé API invalide" lors des appels suivants. Le processus de génération et de désactivation de la clé n'est pas synchronisé correctement.

Terminé
Analyse rapide 🩺 — pourquoi ça marche au premier coup puis “Invalid API key” dès qu’on refresh ?
Cycle de vie actuel de la clé

/user/me est appelé.

newUserService.getMe : aucune clé enabled ⇒ generateKey().

generateKey() commence par disableMyKeys(userId) puis crée une nouvelle clé.

Le front reçoit cette clé et la stocke (ex. localStorage) ✅.

Au rafraîchissement

Le navigateur renvoie l’en‑tête X-API-KEY avec l’ancienne clé.

Dans le même temps, /user/me est rejoué ; comme la clé précédente a été disabled à l’étape 3, le tableau user.apiKeys est vide ➜ on régénère encore une nouvelle clé.

Toutes les requêtes sortantes qui utilisent toujours l’ancienne clé passent alors par le middleware requireApiKey → verifyKey() → Invalid API key.

👉 Conclusion : tu tournes la clé à chaque appel — le client garde une clé périmée ; d’où le 500.

Correctifs possibles ⚙️💡
Option	Idée	Avantages	Inconvénients / Compromis
A. Ne plus désactiver avant de créer	Supprimer repo.disableMyKeys(userId)	Plus simple, plusieurs clés peuvent co‑exister (utile pour multi‑device)	Pas de “clé unique” par utilisateur ; il faudra gérer la révocation autrement
B. Désactiver après avoir créé	Créer la nouvelle clé, récupérer son id, puis UPDATE ... WHERE user_id = $1 AND id <> $newId	Unicité maintenue, mais on ne désactive pas la clé qu’on vient de générer	Requiert une transaction ou deux queries
C. Conserver et renvoyer la même clé	Dans getMe : si une clé disabled existe, la ré‑activer au lieu d’en créer une nouvelle	Pas de rotation à chaque refresh, une seule clé	Complexifie un peu la logique
D. Mettre la clé côté cookie HttpOnly	Évite le localStorage + header manuels	Sécurité et DX accrues	Pas toujours possible côté SPA, CSRF à gérer

Implémentation recommandée (Option B — rotation contrôlée) 🚀
ts
Copier
Modifier
// src/db/services/apiKey.new.service.ts
generateKey: async ({ userId, name, expiresIn = 30 * 24 * 60 * 60 }) => {
  return await db.transaction(async (tx) => {
    // 1. Créer la nouvelle clé
    const { key, id: newId } = await auth.api.createApiKey({
      body: { userId, name, expiresIn },
    });

    // 2. Désactiver toutes les autres
    await tx
      .update(apiKeys)
      .set({ enabled: false })
      .where(and(eq(apiKeys.userId, userId), neq(apiKeys.id, newId)));

    return { key };
  });
}
Et dans getMe :

ts
Copier
Modifier
// Conserver la clé si elle existe, même disabled
let apiKey = user.apiKeys?.[0]?.key
if (!apiKey) {
  const { key } = await apiKeyService.generateKey({ userId });
  apiKey = key;
}
Filets de sécurité supplémentaires 🛡️
Cache côté front

Invalider / remonter la clé dès que /user/me répond ; ne jamais réutiliser une ancienne valeur.

Header conditionnel

N’ajouter X-API-KEY qu’aux routes protégées par protectedProcedureAPI (par ex. axios interceptor ciblé).

Mettre à jour le schéma

Ajoute un champ current ou last_rotated_at sur la table api_keys pour tracer l’actif.

Tests e2e

Vérifie le scénario login → refresh → appel protégé : la clé doit rester valable.

TL;DR 🧠
La chaîne disableMyKeys → createApiKey désactive toutes les clés, y compris celle générée la requête précédente.

Au refresh, le client ré‑utilise cette clé devenue invalide ➜ 500 “Invalid API key”.

Fix : ne désactive pas la clé fraîche, ou ne régénère la clé que si aucune enabled n’existe, puis assure‑toi que le client met à jour son stockage.

Avec ça, plus de pluie d’erreurs 500 à chaque F5… et tes logs te diront merci. 😎👌
 */
