import MisstepError from '../errors/MisstepError';

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

class Logger {
  construct(options = { logger: console }) {
    if(typeof options === 'object' && options && options.skip_validate){
      this.logger = options.logger;
      this.logger.warn('MisstepWarning: Overriding Misstep.Logger constructor options validation is not advised. It could result in runtime errors being thrown');
    }else if(Logger.validateOptions(options)){
      this.logger = options.logger;
    }
  }

  error() {
    return this.logger.error.apply(this.logger, arguments);
  }

  warn() {
    return this.logger.warn.apply(this.logger, arguments);
  }

  log() {
    return this.logger.log.apply(this.logger, arguments);
  }

  info() {
    return this.logger.info.apply(this.logger, arguments);
  }

  debug() {
    return this.logger.debug.apply(this.logger, arguments);
  }

  static validateOptions(options){
    let options_is_object = typeof options === 'object' && options;
    let logger_is_object = options_is_object && typeof options.logger === 'object' && options.logger;
    let logger_has_functions = !options_is_object || !logger_is_object ||
                               Object.keys(LEVELS.NPM).map(k => k.toLowerCase()).reduce((acc, k) => {
                                 if(!(typeof options.logger[k] === 'function')){
                                   acc.push(k);
                                 }
                                 return acc;
                               }, []);
    if(Array.isArray(logger_has_functions) && !logger_has_functions.length){
      return true;
    }else if(Array.isArray(logger_has_functions) && logger_has_functions.length){
      let dataPath = logger_has_functions.map(k => `.logger.${k}`);
      dataPath = dataPath.length > 1 ? dataPath : dataPath[0];
      let schemaPath = logger_has_functions.map(k => `/logger/${k}`);
      schemaPath = schemaPath.length > 1 ? schemaPath : schemaPath[0];
      throw new MisstepError('MisstepError: Logger options did not pass validation. See payload for more information', {
        keyword: logger_has_functions.length === 1 ? logger_has_functions[0] : logger_has_functions,
        dataPath: dataPath,
        schemaPath: schemaPath,
        params: {
          type: 'function'
        }
      });
    }else{
      throw new MisstepError('MisstepError: Logger options did not pass validation. See payload for more information', {
        keyword: options_is_object ? '' : 'logger',
        dataPath: options_is_object ? '' : '.logger',
        schemaPath: options_is_object ? '/' : '/logger',
        params: {
          type: 'object',
          required: options_is_object ? undefined : true
        }
      });
    }
  }
}

Logger.LEVELS = LEVELS;
