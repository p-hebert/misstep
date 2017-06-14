import ExtendableError from './ExtendableError';

class ResponseError extends ExtendableError {
  constructor(error = {}){
    super(error.message, error.payload);
    this.status = error.status || 500;
    this.type = error.type || 'RESPONSE:DEFAULT:ERROR';
  }
}

export default ResponseError;
