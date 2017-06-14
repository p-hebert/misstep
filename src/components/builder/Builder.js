import Ajv from 'ajv';
import ajv_subclassof from '../../utilities/ajv-keywords/subclassof.js';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import { Logger } from '../logger/Logger';
import MisstepError from '../errors/MisstepError';
import ExtendableError from '../errors/ExtendableError';
import DefaultError from '../errors/DefaultError';
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
      ajv_subclassof(ajv);
      ajv_instanceof(ajv);
      ajv_instanceof.definition.CONSTRUCTORS.Logger = Logger;
      ajv_subclassof.definition.CONSTRUCTORS.ExtendableError = ExtendableError;
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
    }, default_constructors);

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
    if(!error || typeof error !== 'object'){
      error = {
        type: 'DEFAULT:FALLBACK:ERROR',
        payload: error
      };
    }

    if(error.type && typeof error.type === 'string'){
      type = this.parseErrorType(error.type);
    }else{
      error.type = 'DEFAULT:FALLBACK:ERROR';
      type = this.parseErrorType(error.type);
    }
    let Callback = this.getErrorCallback(type);
    let Constructor = this.getErrorConstructor(type);
    // Preparing the error for constructor
    if(type.valid){
      error.type = `${type.category.name}:${type.subcategory.name}:${type.detailed.name}`;
      error.status = error.status || type.status;
      error.message = error.message || type.detailed.description;
    }else{
      // Sends a partially typed error
      error.type = type.category.name;
      if(type.status){
        error.status = error.status || type.status;
      }
      if(type.subcategory){
        error.type += `:${type.subcategory.name}`;
        error.message = error.message || type.subcategory.description;
      }else{
        error.message = error.message || type.category.description;
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
      return DefaultError;
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
    let status;

    // Category
    category = error_enum.find((c) => { return c.name === arr[0]; });
    if(category){
      type.category = {
        name: category.name,
        description: category.description
      };
      if(category.status){
        status = category.status;
      }
    }
    // Subcategory
    if(arr.length > 1 && category){
      subcategory = category.children.find((c) => { return c.name === arr[1]; });
      if(subcategory){
        type.subcategory = {
          name: subcategory.name,
          description: subcategory.description
        };
        if(status && subcategory.status){
          status = subcategory.status === 'inherit' ? status : subcategory.status;
        }
      }
    }
    // Detailed
    if(arr.length > 2 && subcategory){
      detailed = subcategory.children.find((c) => { return c.name === arr[2]; });
      if(detailed){
        type.detailed = {
          name: detailed.name,
          description: detailed.description
        };
        if(status && detailed.status){
          status = detailed.status === 'inherit' ? status : detailed.status;
        }
        type.valid = true;
      }
    }
    if(status){
      type.status = status;
    }
    return type;
  }
}

export default Builder;
