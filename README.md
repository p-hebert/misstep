# misstep

Error handling library aiming at standardizing JS error handling practices thoughout the JS stack

[![Build Status](https://travis-ci.org/p-hebert/misstep.svg?branch=master)](https://travis-ci.org/p-hebert/misstep)
[![npm version](https://badge.fury.io/js/misstep.svg)](https://www.npmjs.com/package/misstep)
[![Coverage Status](https://coveralls.io/repos/epoberezkin/ajv/badge.svg?branch=master&service=github)](https://coveralls.io/github/epoberezkin/ajv?branch=master)
[![Dependencies Status](https://david-dm.org/p-hebert/misstep.svg)](https://david-dm.org/)

## <a name="moving"></a>Moving Notice

This repository has been transferred to https://github.com/we-human-space/misstep

## <a name="why"></a>Why?

Common error handling practices generally are not standardized and result in less than meaningful errors,  for both developers and clients alike.

For instance,
```js
throw new Error('Invalid value for user.age, enter a valid integer')
```
is not an actionable error message, and monkey-patching the error object before throwing to add a payload is unsightly.

Sharing the message across configurations and programmatically handling errors quickly becomes a complex, messy task with lots of conditional statements polluting your code.

Misstep solves these issues.

## <a name="how"></a>How?

Misstep provides you with a standardized system for serializing and hydrating errors
so that you can share your error configurations across your setups with ease. More
specifically, Misstep receives a configuration object outlining the major features
of your error types, including default descriptions, HTTP status where applicable,
and constructors associated with each types.

Just like logging, error handling is what we call a
[cross-cutting concern](https://en.wikipedia.org/wiki/Cross-cutting_concern)
in Aspect-oriented programming. Misstep does not impose Aspect-oriented programming
practices; what it does however, is that it allow to centralize all error handling
in one place, thus standardizing your error handling practices for more predictable
behaviours and better crash mitigation.

The Builder module ensures that all of your error messages and types are properly
documented in a centralized enum JSON document, thus allowing your error-handling
configuration to be easily shareable across setups and environments. From a single
type string, the Builder can hydrate errors from a serialized object.

The Catcher module provides standardized callbacks to use in your Promise.catch and
try-catch blocks, thus ensuring that your error-handling logic is abstracted and
centralized in a single module.
