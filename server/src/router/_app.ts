import { router } from '../middlewares/index';

import * as auth from './auth';
import { checkPulseRouter } from './checkPulse';
import { helloWorldRouter } from './helloworld';
import { predictRouter } from './predicts';

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
export const appRouter = router({
  predictPneumonia: predictRouter,
  helloWorldRouter: helloWorldRouter,
  checkPulseRouter: checkPulseRouter,
  auth: {
    github: auth.githubRouter,
    google: auth.googleRouter,
    user: auth.userRouter,
  },
}); //.strict(); //no undefined

export type AppRouter = typeof appRouter;
// ts-prune-ignore-next
export type RouterInputs = inferRouterInputs<AppRouter>;
// ts-prune-ignore-next
export type RouterOutputs = inferRouterOutputs<AppRouter>;
