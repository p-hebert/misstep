import Ajv from 'ajv';
import Logger from './Logger';
import MisstepError from '../errors/MisstepError';
import optschema from './options.ajv.json';

class Misstep {
  constructor(options){
    if(typeof options === 'object' && options && options.skip_validate){
      console.warn('MisstepWarning: Overriding Misstep constructor options validation is not advised. It could result in runtime errors being thrown');
    }else{
      let ajv = new Ajv();
      if(ajv.validate(optschema, options)){
         // TODO: Do all the business logic stuff here
      }else{
        throw new MisstepError('MisstepError: Misstep options did not pass validation. See payload for more information', ajv.errors);
      }
    }
  }
}

export default Misstep;
