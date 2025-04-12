import { router } from '../trpc';
import { predictRouter } from './predicts';

export const appRouter = router({
  predictPneumonia: predictRouter,
});

// eslint-disable-next-line no-unused-vars
type AppRouter = typeof appRouter;
