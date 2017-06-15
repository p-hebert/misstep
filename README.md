# misstep

Error handling library aiming at standardizing JS error handling practices thoughout the JS stack

[![Build Status](https://travis-ci.org/p-hebert/misstep.svg?branch=master)](https://travis-ci.org/p-hebert/misstep)
[![npm version](https://badge.fury.io/js/misstep.svg)](https://www.npmjs.com/package/misstep)
[![Coverage Status](https://coveralls.io/repos/epoberezkin/ajv/badge.svg?branch=master&service=github)](https://coveralls.io/github/epoberezkin/ajv?branch=master)
[![Dependencies Status](https://david-dm.org/p-hebert/misstep.svg)](https://david-dm.org/)

## Content

* [Why?](#why)
* [How?](#how)
* [Features](#features)
  * [Misstep](#feature-misstep)
  * [Logger](#feature-logger)
  * [Builder](#feature-builder)
  * [Catcher](#feature-catcher)
  * [Error types](#feature-error-types)
* [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Import](#import)
* [Usage](#usage)
  * [Builder](#usage-builder)
  * [Catcher](#usage-catcher)
* [API](#api)
  * [Misstep](#api-misstep)
  * [Logger](#api-logger)
  * [Builder](#api-builder)
  * [Catcher](#api-catcher)
  * [Example](#api-example)

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

## <a name="features"></a>Features

### <a name="feature-misstep"></a>Misstep

*Front-facing module wrapping the builder and catcher in a convenient interface*

### <a name="feature-logger"></a>Logger

*Wrapper for your logger so that logs made by Misstep are redirected to your logger.*

* Implements the six npm logging levels (ERROR, WARN, INFO, VERBOSE, DEBUG, SILLY)
* Exposes the six npm logging levels as methods, plus binds `log` to `info`.
* Has a default logger instance (Misstep.logger) that is available as an export of the library. Said default logger logs to console.

### <a name="feature-builder"></a>Builder

*Hydrates errors from a JS object*

* Can hydrate an error object from a string of the format `CATEGORY:SUBCATEGORY:DETAILED`
* Accepts either callbacks or constructors to hydrate enum types.
* Supports custom error constructors and callbacks as well
as error definition enums
* Falls back to a `DEFAULT:FALLBACK:ERROR` of type `DefaultError` if passed serialization is invalid.
* Can construct errors out of incomplete type strings such as `CATEGORY:SUBCATEGORY` and `CATEGORY`

### <a name="feature-catcher"></a>Catcher

*Provides catcher callbacks for both async and sync code*

* Provides default callbacks `barebone` and `response` to catch your errors and log them / send them back to the client
* Supports custom callbacks
* If options are passed, can throw, reject, resolve, or return the error passed to the callback

### <a name="feature-error-types"></a>Error types

*Error types defined by Misstep and exported to be available to the developer.*

* Includes `ExtendableError`, `DefaultError` and `ResponseError` by default.
* Includes configuration files for the Builder to enable support of builtin errors such as `ReferenceError` and `TypeError` (`Misstep.builtin_types`, `Misstep.builtin_enum`)


## <a name="getting-started"></a>Getting Started

### <a name="installation"></a>Installation

```sh
yarn add misstep
```

(We strongly advise you to use `yarn` instead of `npm`. If you don't already, [go give them some love!](https://yarnpkg.com))

### <a name="import"></a>Import

#### ES2015 / ES6
```js
import Misstep from 'misstep'

const misstep = new Misstep(options);
```

#### ES5
```js
const Misstep = require('misstep');

const misstep = new Misstep(options);
```

See API > Constructor Options for more details on what options to pass to the Misstep constructor.

## <a name="usage"></a>Usage

### <a name="usage-builder"></a>Builder

```js
misstep.builder({type: 'RESPONSE:DEFAULT:ERROR'}); // Returns an Error of type ResponseError
```

### <a name="usage-catcher"></a>Catcher
```js
const misstep = new Misstep(options);

// ExpressJS middleware function
// Will return a JSON response to the front-end with the serialized error as content
function(req, res, next) {
  return Promise.reject(misstep.builder({type: 'RESPONSE:DEFAULT:ERROR', message: 'Oh noes!'}))
  .catch(misstep.catcher({type: 'response', res: res}));
}
```

## <a name="api"></a>API

### <a name="api-misstep"></a>Misstep

#### `new Misstep(options)`

```js
let misstep = new Misstep(options);
```

*Wraps all other components and handles their instanciation.
Albeit you can instanciate each of the submodules individually, it is strongly
suggested that you rely on the Misstep constructor for all of your needs.*

* **options.logger (optional) {object}**: The options for the Logger constructor.
  See [`new Logger(options)`](#api-logger-constructor) for more details.
* **options.builder (optional) {object}**: The options for the Builder constructor. See below
  for more details.
* **options.catcher (optional) {object}**: The options for the Catcher constructor. See below
  for more details.
* **skip_validate (optional) {boolean}**: If true, skips validation of the options **for Logger,
   Builder AND Catcher** but raises a single warning. We advise against doing this
   cause this could raise errors later during runtime. Defaults to `false`.
* **no_warn (optional) {boolean}**: If true, suppresses the warning associated with skip_validate.
   Defaults to `undefined`. If false is supplied alongside skip_validate, multiple
   warnings will be issued instead of just one by the Misstep constructor.

#### `misstep.catcher(options)`

*Easy interface to call the `Catcher.catcher` method.*

See the [`Catcher.catcher`](#api-catcher-catcher) section for more information on the signature
of the function.

##### Example

```js
let misstep = new Misstep(options);
// Promise chain
return validate()
.then(process)
.then(persist)
.then(respond)
.catch(misstep.catcher({type: 'response', options: {throw: true}}));

```

#### `Misstep.builder`

*Easy interface to call the `Builder.construct` method.*

See the [`Builder.construct`](#api-builder-construct) section for more information on the signature
of the function.

##### Example

```js
let misstep = new Misstep(options);

function myfunc() {
  // ...
  if(condition){
    throw misstep.builder({
      type: 'CUSTOM:DEFAULT:ERROR',
      message: 'Some very insightful message',
      payload: 'Some supplementary information'
    });
  }else{
    // do something else
  }
}
```


### <a name="api-logger"></a>Logger

#### <a name="api-logger-constructor"></a>`new Misstep.Logger([options])`

```js
let logger = new Misstep.Logger(options);
```

* **options.logger (optional) {object}**: Your logger object, with member functions for all npm
   log levels (error, warn, info, verbose, debug, silly). Note that ommitting to pass
   something to the constructor Misstep.Logger will result in the default console logger
   to be used in place of options.logger.
* **options.skip_validate (optional) {boolean}**: If true, skips validation of the options but raises a
   warning. We advise against doing this cause this could raise errors later during
   runtime. Defaults to `false`.
* **options.no_warn (optional) {boolean}**: If true, suppresses the warning associated with skip_validate.
   Defaults to `false`.

#### `logger.error(args)`

*Logging methods for the logger object. Logs at the ERROR level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.warn(args)`

*Logging methods for the logger object. Logs at the WARN level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.info(args)`

*Logging methods for the logger object. Logs at the INFO level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.log(args)`

*Logging methods for the logger object. Logs at the INFO level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.verbose(args)`

*Logging methods for the logger object. Logs at the VERBOSE level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.debug(args)`

*Logging methods for the logger object. Logs at the DEBUG level.*

* **args**: Any argument that can be handled by your logger.

#### `logger.silly(args)`

*Logging methods for the logger object. Logs at the SILLY level.*

* **args**: Any argument that can be handled by your logger.

### <a name="api-builder"></a>Builder

#### `new Builder(options)`

* **options.logger {Logger}**: A Misstep.Logger instance for logging purposes. If
  the Builder is instantiated through `new Misstep(options)`, Misstep will automatically
  fill this with the Logger instance it creates.
* **options.enum (optional) {Array\<object>}**: An array of object type descriptions.
   Each type object must have three level of depth (category, subcategory, detailed).
   Minimum properties at each level are `name {string}`, `description {string}`
   and `children {Array\<object>}`. For an example of a valid enum, see [/src/components/errors/defaults/enum.json](https://github.com/p-hebert/misstep/blob/master/src/components/errors/defaults/enum.json)
* **options.types (optional) {Array\<object>}**: An array of objects of the format
  `{key, $constructor}` or `{key, callback}`. If every children of a type category
  should be hydrated with the same `$constructor`, opt for `$constructor`.
  Otherwise if some of the children of your category should not be hydrated using
  the same `$constructor`, opt for a `callback` for more leeway.
   * **key {string}**: Name of a category listed in the type enum.
   * **$constructor {class}**: Class/function inheriting from `Misstep.ExtendableError`.
     Constructor arguments are `(error)`, where `error` is of the format

     ```js
     {
       type: 'DEFAULT:FALLBACK:ERROR', // {string}
       payload: 'My error payload', // {*}
       message: 'My error message', // {string}
       status: 400 // {integer} HTTP status, only applicable if your type enum specifies statuses
     }
     ```
     To see an example of a class extending `Misstep.ExtendableError`, see [/src/components/errors/DefaultError.js](https://github.com/p-hebert/misstep/blob/master/src/components/errors/DefaultError.js)
   * **callback {function}**: Function with arguments `(type, error)`, where `type` is
     of the format

     ```js
     {
       category: {name, description},
       subcategory: {name, description},
       detailed: {name, description},
       status: 400 //HTTP status, only applicable if your type enum specifies statuses
     }
     ```
     and `error` is of the same format as specified for the constructor arguments.
     To see an example of a callback, see [/src/components/errors/builtins/errors.js](https://github.com/p-hebert/misstep/blob/master/src/components/errors/builtins/errors.js)
* **skip_validate (optional) {boolean}**: If true, skips validation of the options
   but raises a warning. We advise against doing this cause this could raise errors
   later during runtime. Defaults to `false`.
* **no_warn (optional) {boolean}**: If true, suppresses the warning associated with skip_validate.
   Defaults to `false`.

#### <a name="api-builder-construct"></a>`builder.construct(options)`

*Hydrates the passed serialized error. `misstep.builder` redirects to this method.*

* **options.type (optional) {string}**: Type string of the format
  `CATEGORY:SUBCATEGORY:DETAILED` representing the type of the error. A valid type
  string includes the three subsections, separated by colons. Defaults to
  `DEFAULT:FALLBACK:ERROR` if the type is not a string or is falsy.
* **options.message (optional) {string}**: Message to give to the error constructor.
  Defaults to the type description specified in your type enum.
* **options.payload (optional) {*}**: Extra information to pass along with
  the error. Can be of any type.
* **options.status (optional) {integer}: HTTP Status to associate with this instance
  of your error (where applicable).

### <a name="api-catcher"></a>Catcher

#### `new Misstep.Catcher(options)`

*Constructor of the Catcher module. calls catcher.addCatcher on the options.catchers argument.*

* **options.logger {Logger}**: A Misstep.Logger instance for logging  purposes. If
   the Catcher is instantiated through `new Misstep(options)`, Misstep will automatically
   fill this with the Logger instance it creates.
* **options.catchers (optional) {object}**: A hashmap of custom callbacks that can be later
   used as catchers. For more information regarding these callbacks, see [`catcher.addCatcher(params)`](#api-catcher-addcatcher).

#### <a name="api-catcher-addcatcher"></a>`catcher.addCatcher(catchers)`

*Adds callbacks to the bank of callbacks that can be used as catchers. This method
 is not readily available from the Misstep object, but is called upon construction
 of the Catcher object.*

* **catchers {object}**: Hashmap of callbacks to be added to the catcher module.

The callback should have the following signature: `cb(options, ...bind, error)`.
* **options {object}**: Object outlining the action to be taken with the error at
  the end of the callback. The options object can have four boolean properties:
  `throw`, `reject`, `resolve`, `return`. The first one with a truthy value in order
  of severity will be executed (throw > reject > resolve > return). If options is
  not supplied in the params of `catcher.catcher`, the default is to `return undefined`
  at the end of the callback. It is your responsibility to call the `this.handleOptions(options, error)`
  at the end of your callback to enforce that the requested action is executed.
  * **options.logger {Logger}**: is the Logger instance used by the current Misstep instance
* **bind {Array}**: Array of arguments to bind dynamically to your callback when calling the
  catcher.catcher(). If no extra bind arguments are supplied, no extra bind arguments
  are bound.
* **error {\*}**: The error thrown by your program

#### `catcher.barebone(options, error)`

*Returns a barebone catcher callback that receives an error object and handles it.
The barebone callback simply logs the error then handles the options. Is also
accessible through `catcher.catcher({type: 'barebone'})`*

* **options {object}**: Options for handleOptions. See `catcher.addCatcher` for
  more info.
* **error {\*}**: The error thrown by your program

#### `catcher.response(options, res, error)`

*Returns a response catcher callback that receives an error object and handles it.
The response callback logs the error, sends the request back to the user, then
handles the options. Is also accessible through `catcher.catcher({type: 'response'})`*

* **options {object}**: Options for handleOptions. See `catcher.addCatcher` for
  more info.
* **res {object}**: The response for the client. This response handler is made
  specifically for the ExpressJS API. Hence the `res` parameter must have `status`
  and `json` methods exposed that can be chained.
* **error {\*}**: The error thrown by your program

**NOTE**: Bear in mind that if you call `catcher.response` via
`catcher.catcher({type: 'response'})` you must include a bind parameter that has
a value of `res` or `[res]`.


#### <a name="api-catcher-catcher"></a>`catcher.catcher(params)`

*Returns a catcher callback that receives an error object and handles it.*

* **params.type (optional) {string}**: Key for the catcher callback you want to use. Defaults
  to 'barebone' if not supplied or if the key cannot be found. Unless you have
  overwritten the default 'barebone' callback with your own through
  `catcher.addCatcher({'barebone': callback})` or the constructor `catchers` option,
  this is equivalent to calling `catcher.barebone`.
* **params.options (optional) {object}**: Supplies the handleOptions options object.
  See `catcher.addCatcher` for more info.
* **params.bind (optional) {Array}**: Supplies supplementary arguments to be bound
  to the callback after `options`


### <a name="api-example"></a>Example

Whew that's a lot of information! Well the good thing is, once you have
instantiated your Misstep module properly, it's really easy to use! You can
find an example in [/docs/examples](https://github.com/p-hebert/misstep/blob/master/docs/examples)
