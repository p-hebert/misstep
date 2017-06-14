const ResponseError = require('Misstep').ResponseError;

class ValidationError extends ResponseError {
  constructor(error = {}){
    super(error.message, error.payload);
    this.status = error.status || 400;
    this.type = error.type || 'VALIDATION:DEFAULT:ERROR';
  }
}

module.exports = ValidationError;
