import { assert, describe, expect, it, vi } from 'vitest';

/*
  This is a demonstration of an issue that happens in certain cases
  involving promises and fake timers.

  I think there's something different in how fake timers are handled
  in the event loop compared to real timers and that causes the
  issues.
 */

async function promiseFunction() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000);
  });
}

/*

✅ - Test should not fail and does not fail
❌ - Test should not fail, but does fail
⚠️ - Test does not fail, but looks unsafe

*/

describe('Demoing the issue with fake timers and promises created inside of them', () => {
  it('✅ using a real timer', async () => {
    vi.useRealTimers();

    const promise = await promiseFunction();

    expect(promise).toBe('resolved');
  });

  it('❌ using a fake timer', async () => {
    // This one fails, with this error:
    // "Error: Test timed out in 5000ms.""
    vi.useFakeTimers();

    const promise = await promiseFunction();
    await vi.runAllTimersAsync();

    expect(promise).toBe('resolved');
  });

  it('⚠️ run all fake timers asynchronously ', async () => {
    vi.useFakeTimers();

    vi.runAllTimersAsync();
    const result = await promiseFunction();
    expect(result).toBe('resolved');
  });

  it('⚠️ let the promise be executed asynchronously and run all fake timers synchronously', async () => {
    vi.useFakeTimers();

    const promise = promiseFunction();
    await vi.runAllTimersAsync();

    expect(promise).resolves.toBe('resolved');
  });
});
