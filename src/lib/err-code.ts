// Source: https://github.com/IndigoUnited/js-err-code/blob/master/index.js

type Extensions = Record<string, any>;

type Err = Error & Extensions;

function assign(obj: Error, props: Extensions): Error & Extensions {
  for (const key in props) {
    Object.defineProperty(obj, key, {
      value: props[key],
      enumerable: true,
      configurable: true,
    });
  }

  return obj;
}

function createError(err: any, code: string | Extensions, props?: Extensions): Err {
  if (!err || typeof err === 'string') {
    throw new TypeError('Please pass an Error to err-code');
  }

  if (!props) {
    props = {};
  }

  if (typeof code === 'object') {
    props = code as Extensions;
    code = '';
  }

  if (code) {
    props['code'] = code;
  }

  try {
    return assign(err, props);
  } catch (_) {
    props['message'] = err.message;
    props['stack'] = err.stack;

    const ErrClass: any = function () {};

    ErrClass.prototype = Object.create(Object.getPrototypeOf(err));

    const output = assign(new ErrClass(), props);

    return output;
  }
}

module.exports = createError;
