import ExtendableError from './ExtendableError';

class MisstepError extends ExtendableError {
  constructor(message, payload){
    super(message, payload);
    this.type = "MISSTEP:DEFAULT:ERROR";
  }
}

export default MisstepError;
