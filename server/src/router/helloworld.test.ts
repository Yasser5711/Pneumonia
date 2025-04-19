import { describe, expect, it } from 'vitest';
import { createTestCaller } from '../../test/caller';

describe('hello world', () => {
  const caller = createTestCaller();

  it('should return hello world', async () => {
    const result = await caller.helloWorldRouter({});
    expect(result).toEqual({ message: 'Hello, Guest!' });
  });

  it('should return hello world with name', async () => {
    const result = await caller.helloWorldRouter({ name: 'John' });
    expect(result).toEqual({ message: 'Hello, John!' });
  });
});
