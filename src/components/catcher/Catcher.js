import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import { Logger } from '../logger/Logger';
import MisstepError from '../errors/MisstepError';
import ResponseError from '../errors/ResponseError';
import optschema from './options.ajv.json';

let private_store = new WeakMap();

class Catcher {
  constructor(options) {
    // Validation
    if(typeof options === 'object' && options && options.skip_validate){
      options.no_warn || options.logger.warn('MisstepWarning: Overriding Misstep.Catcher constructor options validation is not advised. It could result in runtime errors being thrown');
    }else if(typeof options !== 'object'){
      throw new MisstepError('Misstep.Catcher options is not an object.');
    }else{
      let ajv = new Ajv();
      ajv_instanceof(ajv);
      ajv_instanceof.definition.CONSTRUCTORS.Logger = Logger;
      if(!ajv.validate(optschema, options)){
        throw new MisstepError('Misstep.Catcher options did not pass validation. See payload for more information', ajv.errors);
      }
    }
    // Setting Logger
    private_store.set(this, options.logger);
    // Setting Custom Catchers
    this.catchers = {
      names: ['barebone', 'response'],
      callbacks: {}
    };
    if(options.catchers){
      this.addCatchers(options.catchers);
    }
  }

  addCatchers(catchers) {
    let self = this;
    Object.keys(catchers).forEach((k) => {
      self.catchers.names.push(k);
      self.catchers.callbacks[k] = catchers[k];
    });
  }

  catcher(params) {
    let name = params.type;
    let bind;
    // Obtaining the args to bind to the callback from the params
    if(typeof params === 'function'){
      throw new MisstepError('Cannot pass a function as parameters to Catcher.catch.');
    }else if(params.bind && typeof params.bind === 'object'){
      if(Array.isArray(params.bind)){
        bind = [].slice.call(params.bind);
      }else{
        try{
          bind = Array.from(params.bind);
        }catch(e){
          bind = [];
        }
      }
    }else if(params.hasOwnProperty('bind')){
      bind = [params.bind];
    }else{
      bind = [];
    }
    // Adding the options and logger as first two args of signature
    params.options = params.options ? params.options : {};
    bind.unshift({ ...params.options, logger: private_store.get(this) });

    if(!name || this.catchers.names.indexOf(name) === -1) {
      if(this.catchers.callbacks['barebone']){
        return this.catchers.callbacks['barebone'].bind(this, ...bind);
      }else{
        return this.barebone.bind(this, ...bind);
      }
    }else{
      switch(name) {
      case 'barebone':
      case 'response':
        if(this.catchers.callbacks[name]){
          return this.catchers.callbacks[name].bind(this, ...bind);
        }else{
          return this[name].bind(this, ...bind);
        }
      default:
        return this.catchers.callbacks[name].bind(this, ...bind);
      }
    }
  }

  handleOptions(options, err) {
    if(options){
      if(options.throw){
        throw err;
      }else if(options.reject){
        return Promise.reject(err);
      }else if(options.resolve){
        return Promise.resolve(err);
      }else if(options.return){
        return err;
      }
    }
  }

  barebone(options, err) {
    let logger = private_store.get(this);
    logger.error(err);
    return this.handleOptions(options, err);
  }

  response(options, res, err) {
    let logger = private_store.get(this);
    logger.error(err);
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
    return this.handleOptions(options, err);
  }
}

export default Catcher;
