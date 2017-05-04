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
