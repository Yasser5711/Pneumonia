import { OAuth2Namespace } from '@fastify/oauth2';

declare module 'fastify' {
  export interface FastifyInstance {
    githubOauth: OAuth2Namespace;
    googleOauth: OAuth2Namespace;
  }
}
