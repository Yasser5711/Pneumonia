import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../trpc';
import { helloWorldRouter } from './helloworld';
import { predictRouter } from './predicts';
export const appRouter = router({
  predictPneumonia: predictRouter,
  helloWorldRouter: helloWorldRouter,
});

export type AppRouter = typeof appRouter;
// ts-prune-ignore-next
export type RouterInputs = inferRouterInputs<AppRouter>;
// ts-prune-ignore-next
export type RouterOutputs = inferRouterOutputs<AppRouter>;
