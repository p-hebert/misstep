import Ajv from 'ajv';
import ajv_typeof from 'ajv-keywords/keywords/typeof';
import Logger from '../logger/Logger';
import MisstepError from '../errors/MisstepError';
import optschema from './options.ajv.json';

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
    // TODO: Do all the business logic stuff here
  }
}

export default Misstep;
