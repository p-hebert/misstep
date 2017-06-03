import ResponseError from '../../../src/components/errors/ResponseError';

class ExtendedResponseError extends ResponseError {
  constructor(error = {}){
    super(error);
  }
}

export default ExtendedResponseError;
