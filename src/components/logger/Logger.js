import Ajv from 'ajv';
import MisstepError from '../errors/MisstepError';
import optschema from './options.ajv.json';

const LEVELS = {
  NPM: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    VERBOSE: 3,
    DEBUG: 4,
    SILLY: 5
  },
  RFC5424: {
    EMERG: 0,
    ALERT: 1,
    CRIT: 2,
    ERROR: 3,
    WARN: 4,
    NOTICE: 5,
    INFO: 6,
    DEBUG: 7
  }
};

class Logger {
  construct(options) {
    if(typeof options === 'object' && options && options.skip_validate){
      console.warn('MisstepWarning');
    }else{
      let ajv = new Ajv();
      if(ajv.validate(optschema, options)){
         // TODO: Do all the business logic stuff here
      }else{
        throw new MisstepError('MisstepError: Logger options did not pass validation. See payload for more information', ajv.errors);
      }
    }
  }
}

Logger.LEVELS = LEVELS;
