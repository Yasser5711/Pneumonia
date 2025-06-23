import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../middlewares/index';
import { helloWorldRouter } from './helloworld';
import { predictRouter } from './predicts';
import * as auth from './auth';
export const appRouter = router({
  predictPneumonia: predictRouter,
  helloWorldRouter: helloWorldRouter,
  auth: auth.githubAuthRouter,
});

export type AppRouter = typeof appRouter;
// ts-prune-ignore-next
export type RouterInputs = inferRouterInputs<AppRouter>;
// ts-prune-ignore-next
export type RouterOutputs = inferRouterOutputs<AppRouter>;
