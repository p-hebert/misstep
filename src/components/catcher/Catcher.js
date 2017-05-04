import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import Logger from './Logger';
import MisstepError from '../errors/MisstepError';
import ResponseError from '../errors/ResponseError';
import optschema from './options.ajv.json';


class Catcher {
  constructor(options) {
    if(typeof options === 'object' && options && options.skip_validate){
      console.warn('MisstepWarning: Overriding Misstep.Catcher constructor options validation is not advised. It could result in runtime errors being thrown');
    }else{
      let ajv = new Ajv();
      ajv_instanceof(ajv);
      ajv_instanceof.definition.CONSTRUCTORS.Logger = Logger;
      if(!ajv.validate(optschema, options)){
        throw new MisstepError('MisstepError: Misstep.Catcher options did not pass validation. See payload for more information', ajv.errors);
      }
    }
    // TODO: Do all the business logic stuff here
  }

  response(res) {
    return (err) => {
      this.logger.error(err);
      if(err instanceof ResponseError){
        res.status(err.status).json({
          status: err.status,
          type: err.type,
          message: err.message,
          payload: err.payload
        });
      }else{
        if(typeof err === 'object' && err){
          res.status(500).json({
            status: err.status || 500,
            type: 'RESPONSE:DEFAULT:ERROR',
            payload: err
          });
        }else{
          res.status(500).json({
            status: 500,
            type: 'RESPONSE:DEFAULT:ERROR',
            payload: err
          });
        }
      }
    };
  }
}

export default Catcher;
