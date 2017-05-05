# misstep
Error handling library aiming at standardizing JS error handling practices thoughout the JS stack

## Installation

```
npm install misstep
```

## Import

### ES2015 / ES6
```js
import Misstep from 'misstep'
```

### ES5
```js
const Misstep = require('misstep');
```

## Usage

### ErrorBuilder
```js
const misstep = new Misstep(options);
misstep.builder({type: 'RESPONSE:DEFAULT:ERROR'}); // Returns an Error of type ResponseError

```

### ErrorCatcher
```js
const misstep = new Misstep(options);

// ExpressJS middleware function
function(req, res, next) {
  Promise.reject(misstep.builder({type: 'RESPONSE:DEFAULT:ERROR', message: 'Oh noes!'}))
  .catch(misstep.catcher({type: 'RESPONSE', res: res}));
}

```

## Features

  * Robust error handling
  * Provides easily extendable, customizable error types
  * Allows to centralize your error messages in a JSON file that can be shared between your server side and client side applications
  * Can generate custom errors from a simple string, with status, description, payload and more predefined.
  * Provides standardized Promise rejection catcher handlers that can return an Express.js response, simply log or re-throw.
  * Provides a customizable `Logger` wrapper for your prefered logger, with `console` as the default logger

## What are the benefits of using Misstep?

Just like logging, error handling is what we call a
[cross-cutting concern](https://en.wikipedia.org/wiki/Cross-cutting_concern)
in Aspect-oriented programming. Misstep does not impose Aspect-oriented programming
practices; what it does however, is that it allow to centralize all error handling
in one place, thus standardizing your error handling practices for more predictable
behaviours and better crash mitigation.

The ErrorBuilder ensures that all of your error messages and types are properly
documented in a centralized enum JSON document, thus allowing your error-handling
configuration to be easily shareable across setups and environments. From a single
type description, the ErrorBuilder can extract multiple information pertaining to the
error type, thus reducing the amount of data that needs to be sent between processes.

The ErrorCatcher provides standardized callbacks to use in your Promise.catch and
try-catch blocks, thus ensuring that your error-handling logic is abstracted and
centralized in a single module.
