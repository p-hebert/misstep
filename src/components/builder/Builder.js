import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import { Logger } from '../logger/Logger';
import MisstepError from '../errors/MisstepError';
import ExtendableError from '../errors/ExtendableError';
import optschema from './options.ajv.json';
import default_errors from '../errors/defaults/errors.js';
import default_enum from '../errors/defaults/enum.json';

let private_store = new WeakMap();

class Builder {
  constructor(options){
    // Validation
    if(typeof options === 'object' && options && options.skip_validate){
      options.no_warn || options.logger.warn('MisstepWarning: Overriding Misstep.Builder constructor options validation is not advised. It could result in runtime errors being thrown');
    }else if(typeof options !== 'object'){
      throw new MisstepError('Misstep.Builder options is not an object.');
    }else{
      let ajv = new Ajv();
      ajv_instanceof(ajv);
      ajv_instanceof.definition.CONSTRUCTORS.Logger = Logger;
      ajv_instanceof.definition.CONSTRUCTORS.ExtendableError = ExtendableError;
      if(!ajv.validate(optschema, options)){
        throw new MisstepError('Misstep.Builder options did not pass validation. See payload for more information', ajv.errors);
      }
    }

    if(!options.types){
      options.types = [];
    }
    if(!options.enum){
      options.enum = [];
    }

    let default_constructors = default_errors.reduce((acc, t) => {
      acc.constructors[t.key] = t.$constructor;
      return acc;
    }, {constructors: {}, callbacks: {}});
    let option_constructors = options.types.reduce((acc, t) => {
      if(t.$constructor){
        acc.constructors[t.key] = t.$constructor;
        return acc;
      }else{
        acc.callbacks[t.key] = t.callback;
        return acc;
      }
    }, default_constructors) || default_constructors;

    let store = {
      enum: [...default_enum, ...options.enum],
      logger: options.logger,
      types: {
        names: [...default_errors.map(t => t.key), ...options.types.map(t => t.key)],
        ...option_constructors
      }
    };
    private_store.set(this, store);
  }

  construct(error) {
    let type;
    if(typeof error.type === 'string'){
      type = this.parseErrorType(error.type);
    }else{
      type = { valid: false };
    }
    let Callback = this.getErrorCallback(type);
    let Constructor = this.getErrorConstructor(type);
    // Preparing the error for constructor
    if(type.valid){
      error.status = error.status || type.detailed.status;
      error.message = error.message || type.detailed.description;
    }else{
      // Sends a partially typed error
      error.status = error.status || 400;
      if(type.category){
        error.type = type.category.name;
        error.status = error.status || type.category.status;
        if(!type.subcategory){
          error.message = error.message || type.category.description;
        }else{
          error.type += ':' + type.subcategory.name;
          error.status = error.status || type.subcategory.status;
          error.message = error.message || type.subcategory.description;
        }
      }
    }

    if(Callback) {
      return Callback(error);
    }else{
      return new Constructor(error);
    }
  }

  getErrorConstructor(type) {
    let category = !type.category || type.category.name;
    let store = private_store.get(this);
    if(store.types.names.indexOf(category) !== -1){
      return store.types.constructors[category];
    }else{
      return ExtendableError;
    }
  }

  getErrorCallback(type) {
    let category = !type.category || type.category.name;
    let callback = private_store.get(this).types.callbacks[category];
    return callback || null;
  }

  parseErrorType(str) {
    let arr = str.split(':');
    let type = { valid: false };
    let store = private_store.get(this);
    let error_enum = store.enum;
    let category;
    let subcategory;
    let detailed;

    // Category
    category = error_enum.find((c) => { return c.name === arr[0]; });
    if(category){
      type.category = {
        name: category.name,
        status: category.status,
        description: category.description
      };
    }
    // Subcategory
    if(arr.length > 1 && category){
      subcategory = category.children.find((c) => { return c.name === arr[1]; });
      if(subcategory){
        type.subcategory = {
          name: subcategory.name,
          status: subcategory.status === 'inherit' ? category.status : subcategory.status,
          description: subcategory.description
        };
      }
    }
    // Detailed
    if(arr.length > 2 && subcategory){
      detailed = subcategory.children.find((c) => { return c.name === arr[2]; });
      if(detailed){
        type.detailed = {
          name: detailed.name,
          status: detailed.status === 'inherit' ? subcategory.status : detailed.status,
          description: detailed.description
        };
        type.valid = true;
      }
    }
    return type;
  }
}

export default Builder;
