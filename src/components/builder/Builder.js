import default_error_types from '../errors/defaults/types.json';
import default_error_enum from '../errors/defaults/enum.json';

class Builder {
  constructor(options){
  }

  get errorTypes() {
    return Builder.error_types;
  }

  set errorTypes(types) {
    Builder.error_types = { ...Builder.error_types, types };
  }

  static build(error) {
    let type;
    if(typeof error.type === "string"){
      type = Builder.parseErrorType(error.type);
    }else{
      type = { valid: false };
    }
    let Constructor = Builder.getErrorConstructor(type);
    if(type.valid){
      error.status = error.status || type.detailed.status;
      error.message = error.message || type.detailed.description;
    }else{
      error.status = error.status || 400;
      if(type.category){
        error.type = type.category.name;
        error.status = error.status || type.category.status;
        if(!type.subcategory){
          error.message = error.message || type.category.description;
        }
      }
      if(type.subcategory){
        error.type += ":" + type.subcategory.name;
        error.status = error.status || type.subcategory.status;
        error.message = error.message || type.subcategory.description;
      }
    }
    return new Constructor(error);
  }

  static getErrorConstructor(type) {
    let category = !type.category || type.category.name;
    let detailed = !type.detailed || type.detailed.name;
    let constructor;

    return constructor;
  }

  static parseErrorType(str) {
    let arr = str.split(':');
    let type = { valid: false };
    type.category = ErrorEnum.find((c) => { return c.name === arr[0]; });
    if(arr.length > 1 && type.category){
      type.subcategory = type.category.children.find((c) => { return c.name === arr[1]; });
      type.category = {
        name: type.category.name,
        status: type.category.status,
        description: type.category.description,
      };
    }
    if(arr.length > 2 && type.subcategory){
      type.detailed = type.subcategory.children.find((c) => { return c.name === arr[2]; });
      type.subcategory = {
        name: type.subcategory.name,
        status: type.subcategory.status === "inherit" ? type.category.status : type.subcategory.status,
        description: type.subcategory.description,
      };
    }
    if(type.detailed){
      type.detailed = {
        name: type.detailed.name,
        status: type.detailed.status === "inherit" ? type.subcategory.status : type.detailed.status,
        description: type.detailed.description,
      };
      type.valid = true;
    }
    return type;
  }
}

Builder.error_types = { ... default_error_types };

export Builder;
