import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '../trpc';
import { helloWorldRouter } from './helloworld';
import { predictRouter } from './predicts';
export const appRouter = router({
  predictPneumonia: predictRouter,
  helloWorldRouter: helloWorldRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
