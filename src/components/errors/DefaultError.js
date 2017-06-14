import ExtendableError from './ExtendableError';

class DefaultError extends ExtendableError {
  constructor(error = {}){
    super(error.message, error.payload);
    this.type = error.type || 'DEFAULT:FALLBACK:ERROR';
  }
}

export default DefaultError;
