import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
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
  }
};

const logger = {
  error: function() { console.error.apply(console, arguments); },
  warn: function() { console.warn.apply(console, arguments); },
  info: function() { console.log.apply(console, arguments); },
  verbose: function() { console.log.apply(console, arguments); },
  debug: function() { console.debug.apply(console, arguments); },
  silly: function() { console.trace.apply(console, arguments); }
};

class Logger {
  constructor(options = { logger }) {
    if(typeof options === 'object' && options.skip_validate){
      options.logger.warn('MisstepWarning: Overriding Misstep.Logger constructor options validation is not advised. It could result in runtime errors being thrown');
    }else{
      let ajv = new Ajv();
      ajv_instanceof(ajv);
      if(!ajv.validate(optschema, options)){
        throw new MisstepError('MisstepError: Misstep.Logger options did not pass validation. See payload for more information', ajv.errors);
      }
    }
    this.logger = options.logger;
  }

  error() {
    return this.logger.error.apply(this.logger, arguments);
  }

  warn() {
    return this.logger.warn.apply(this.logger, arguments);
  }

  log() {
    return this.logger.info.apply(this.logger, arguments);
  }

  info() {
    return this.logger.info.apply(this.logger, arguments);
  }

  verbose() {
    return this.logger.verbose.apply(this.logger, arguments);
  }

  debug() {
    return this.logger.debug.apply(this.logger, arguments);
  }

  silly() {
    return this.logger.silly.apply(this.logger, arguments);
  }
}

Logger.LEVELS = LEVELS.NPM;

export { logger };
export default Logger;
