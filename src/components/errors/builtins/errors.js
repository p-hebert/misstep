import DefaultError from '../DefaultError';

const errors = [
  {
    'key': 'ECMASCRIPT',
    'callback': function(type, error){
      if(type.valid){
        let err;
        switch(type.detailed.name){
        case 'RANGE_ERROR':
          err = new RangeError(error.message);
          err.type = error.type;
          err.payload = error.payload;
          return err;
        case 'REFERENCE_ERROR':
          err = new ReferenceError(error.message);
          err.type = error.type;
          err.payload = error.payload;
          return err;
        case 'SYNTAX_ERROR':
          err = new SyntaxError(error.message);
          err.type = error.type;
          err.payload = error.payload;
          return err;
        case 'TYPE_ERROR':
          err = new TypeError(error.message);
          err.type = error.type;
          err.payload = error.payload;
          return err;
        case 'URI_ERROR':
          err = new URIError(error.message);
          err.type = error.type;
          err.payload = error.payload;
          return err;
        }
      }
      return new DefaultError(error);
    }
  }
];

export default errors;
