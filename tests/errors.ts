import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import {
  MissingHttpsOptionError,
  MissingStaticFileOptionError,
  FileReadFailureError,
} from '../lib/errors.ts';

const message = 'lorem ipsum';

Deno.test('errors - can construct MissingHttpsOptionError', () => {
  const error = new MissingHttpsOptionError(message);
  assertEquals(error.message, message);
});

Deno.test('errors - can construct MissingStaticFileOptionError', () => {
  const error = new MissingStaticFileOptionError(message);
  assertEquals(error.message, message);
});

Deno.test('errors - can construct FileReadFailureError', () => {
  const error = new FileReadFailureError(message);
  assertEquals(error.message, message);
});
