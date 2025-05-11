/* eslint-disable no-console */
import { generateOpenApiDocument } from '@9or9/trpc-openapi';
import { writeFileSync } from 'fs';
import { version } from '../package.json';
import { env } from '../src/env';
import { appRouter } from '../src/router/_app';
const baseUrl = (env.NODE_ENV !== 'development' ? env.BASE_URL : 'http://localhost:3000') + '/api';
const fileName = env.NODE_ENV !== 'development' ? 'openapi.json' : 'openapi.dev.json';
const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'My APIs',
  version: version,
  baseUrl,
  securitySchemes: {
    apiKeyHeader: {
      description: 'API key required for access',
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
    },
  },
});

// eslint-disable-next-line security/detect-non-literal-fs-filename
writeFileSync(fileName, JSON.stringify(openApiDocument, null, 2));
console.log(`✅ OpenAPI spec written to ${fileName}`);
