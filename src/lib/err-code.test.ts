//github.com/IndigoUnited/js-err-code/blob/master/test/test.js

import { describe, it, expect } from 'bun:test';
const createError = require('./err-code');

describe('errcode', () => {
  describe('string as first argument', () => {
    it('should throw an error', () => {
      expect(() => {
        // @ts-ignore Intended for test
        createError('my message' as any);
      }).toThrow(TypeError);
    });
  });

  describe('error as first argument', () => {
    it('should accept an error and do nothing', () => {
      const myErr = new Error('my message');
      const err = createError(myErr, {});

      expect(err).toBe(myErr);
      expect(err.hasOwnProperty('code')).toBe(false);
    });

    it('should accept an error and add a code', () => {
      const myErr = new Error('my message');
      const err = createError(myErr, 'ESOME');

      expect(err).toBe(myErr);
      expect((err as any).code).toBe('ESOME');
    });

    it('should accept an error object and add code & properties', () => {
      const myErr = new Error('my message');
      const err = createError(myErr, 'ESOME', { foo: 'bar', bar: 'foo' });

      expect(err).toBeInstanceOf(Error);
      expect((err as any).code).toBe('ESOME');
      expect((err as any).foo).toBe('bar');
      expect((err as any).bar).toBe('foo');
    });

    it('should create an error object without code but with properties', () => {
      const myErr = new Error('my message');
      const err = createError(myErr, { foo: 'bar', bar: 'foo' });

      expect(err).toBeInstanceOf(Error);
      expect((err as any).code).toBe(undefined);
      expect((err as any).foo).toBe('bar');
      expect((err as any).bar).toBe('foo');
    });

    it('should set a non-writable field', () => {
      const myErr = new Error('my message');

      Object.defineProperty(myErr, 'code', {
        value: 'derp',
        writable: false,
      });
      const err = createError(myErr, 'ERR_WAT');

      expect(err).toBeInstanceOf(Error);
      expect(err.stack).toEqual(myErr.stack);
      expect((err as any).code).toBe('ERR_WAT');
    });

    it('should add a code to frozen object', () => {
      const myErr = new Error('my message');
      const err = createError(Object.freeze(myErr), 'ERR_WAT');

      expect(err).toBeInstanceOf(Error);
      expect(err.stack).toEqual(myErr.stack);
      expect((err as any).code).toBe('ERR_WAT');
    });

    it('should to set a field that throws at assignment time', () => {
      const myErr = new Error('my message');

      Object.defineProperty(myErr, 'code', {
        enumerable: true,
        set() {
          throw new Error('Nope!');
        },
        get() {
          return 'derp';
        },
      });
      const err = createError(myErr, 'ERR_WAT');

      expect(err).toBeInstanceOf(Error);
      expect(err.stack).toEqual(myErr.stack);
      expect((err as any).code).toBe('ERR_WAT');
    });

    it('should retain error type', () => {
      const myErr = new TypeError('my message');

      Object.defineProperty(myErr, 'code', {
        value: 'derp',
        writable: false,
      });
      const err = createError(myErr, 'ERR_WAT');

      expect(err).toBeInstanceOf(TypeError);
      expect(err.stack).toEqual(myErr.stack);
      expect((err as any).code).toBe('ERR_WAT');
    });

    it('should add a code to a class that extends Error', () => {
      class CustomError extends Error {
        /**
         * @param {any} val - wat
         */
        set code(val) {
          throw new Error('Nope!');
        }
      }

      const myErr = new CustomError('my message');

      Object.defineProperty(myErr, 'code', {
        value: 'derp',
        writable: false,
        configurable: false,
      });
      const err = createError(myErr, 'ERR_WAT');

      expect(err).toBeInstanceOf(CustomError);
      expect(err.stack).toEqual(myErr.stack);
      expect((err as any).code).toBe('ERR_WAT');

      // original prototype chain should be intact
      expect(() => {
        const otherErr = new CustomError('my message');

        (otherErr as any).code = 'derp';
      }).toThrow();
    });

    it('should support errors that are not Errors', () => {
      const err = createError(
        {
          message: 'Oh noes!',
        } as any,
        'ERR_WAT',
      );

      expect((err as any).message).toBe('Oh noes!');
      expect((err as any).code).toBe('ERR_WAT');
    });
  });

  describe('falsy first arguments', () => {
    it('should not allow passing null as the first argument', () => {
      expect(() => {
        createError(null as any, 'CODE');
      }).toThrow(TypeError);
    });

    it('should not allow passing undefined as the first argument', () => {
      expect(() => {
        createError(undefined as any, 'CODE');
      }).toThrow(TypeError);
    });
  });
});
