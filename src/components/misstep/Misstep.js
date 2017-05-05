import Ajv from 'ajv';
import ajv_typeof from 'ajv-keywords/keywords/typeof';
import Logger from '../logger/Logger';
import Catcher from '../catcher/Catcher';
import Builder from '../builder/Builder';
import MisstepError from '../errors/MisstepError';
import optschema from './options.ajv.json';

const private_store = new WeakMap();

class Misstep {
  constructor(options){
    if(typeof options === 'object' && options && options.skip_validate){
      console.warn('MisstepWarning: Overriding Misstep constructor options validation is not advised. It could result in runtime errors being thrown');
    }else{
      let ajv = new Ajv();
      ajv_typeof(ajv);
      if(!ajv.validate(optschema, options)){
        throw new MisstepError('MisstepError: Misstep options did not pass validation. See payload for more information', ajv.errors);
      }
    }

    let instances = {
      logger: new Logger(options.logger),
      catcher: new Catcher(options.catcher),
      builder: new Builder(options.builder)
    };
    private_store.set(this, instances);
  }

  get catcher() {
    return (params) => private_store.get(this).catcher.catcher(params);
  }

  get builder() {
    return (error) => private_store.get(this).builder.construct(error);
  }
}

export default Misstep;
