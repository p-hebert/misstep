import { Logger, logger } from '../logger/Logger';
import Catcher from '../catcher/Catcher';
import Builder from '../builder/Builder';

class Misstep {
  constructor(options = {}){
    var logger_instance;

    if(typeof options === 'object' && options && options.skip_validate){
      let no_warn = options.no_warn;
      options = {
        logger: typeof options.logger === 'object'
                ? {
                    ...options.logger,
                    skip_validate: true,
                    no_warn: options.logger.hasOwnProperty('no_warn')
                             ? options.logger.no_warn : true
                  }
                : { logger, skip_validate: true, no_warn: true },
        catcher: typeof options.catcher === 'object'
                 ? {
                     ...options.catcher,
                     skip_validate: true,
                     no_warn: options.catcher.hasOwnProperty('no_warn')
                              ? options.catcher.no_warn : true
                   }
                 : { logger, skip_validate: true, no_warn: true },
        builder: typeof options.builder === 'object'
                 ? {
                     ...options.builder,
                     skip_validate: true,
                     no_warn: options.builder.hasOwnProperty('no_warn')
                              ? options.builder.no_warn : true
                   }
                 : { logger, skip_validate: true, no_warn: true }
      };
      logger_instance = new Logger(options.logger);
      no_warn || logger_instance.warn('MisstepWarning: Overriding Misstep constructor options validation is not advised. It could result in runtime errors being thrown');
    }else{
      logger_instance = new Logger(options.logger || logger);
    }

    this.instances = {
      logger: logger_instance,
      catcher: new Catcher({...options.catcher, logger: logger_instance}),
      builder: new Builder({...options.builder, logger: logger_instance})
    };
  }

  get catcher() {
    return (params) => this.instances.catcher.catcher(params);
  }

  get builder() {
    return (error) => this.instances.builder.construct(error);
  }
}

export default Misstep;
