import ExtendableError from './ExtendableError';

class MisstepError extends ExtendableError {
  constructor(message, payload){
    super(message, payload);
    this.type = error.type || "MISSTEP:DEFAULT:ERROR";
  }
}

export default MisstepError;
