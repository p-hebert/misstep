import ExtendableError from '../ExtendableError';
import MisstepError from '../MisstepError';
import ResponseError from '../ResponseError';

const errors = [
  {
    'key': 'EXTENDABLE',
    'constructor': ExtendableError
  },
  {
    'key': 'MISSTEP',
    'constructor': MisstepError
  },
  {
    'key': 'RESPONSE',
    'constructor': ResponseError
  }
];

export default errors;
