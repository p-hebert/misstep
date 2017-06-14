import ExtendableError from '../ExtendableError';

const errors = [
  {
    'key': 'ECMASCRIPT',
    'callback': function(error){
      if(error.type.valid){
        let err;
        switch(error.type.detailed){
        case 'RANGE_ERROR':
          err = new RangeError(error.message);
          err.payload = error.payload;
          return err;
        case 'REFERENCE_ERROR':
          err = new ReferenceError(error.message);
          err.payload = error.payload;
          return err;
        case 'SYNTAX_ERROR':
          err = new SyntaxError(error.message);
          err.payload = error.payload;
          return err;
        case 'TYPE_ERROR':
          err = new TypeError(error.message);
          err.payload = error.payload;
          return err;
        case 'URI_ERROR':
          err = new URIError(error.message);
          err.payload = error.payload;
          return err;
        default:
          return new ExtendableError(error.message, error.payload);
        }
      }else{
        return new ExtendableError(error.message, error.payload);
      }
    }
  }
];

export default errors;
