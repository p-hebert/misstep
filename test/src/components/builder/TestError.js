import ExtendableError from '../../../../src/components/errors/ExtendableError';

class TestError extends ExtendableError {
  constructor(error = {}){
    super(error.message, error.payload);
  }
}

export default TestError;
