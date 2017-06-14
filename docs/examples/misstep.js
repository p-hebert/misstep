const Misstep = require('misstep');
const custom_error_enum = require('./custom_error_enum.json');
const custom_error_types = require('./custom_error_types.js');

module.exports = new Misstep({
  logger: { logger: Misstep.logger }, // default logger => console
  builder: {
    // Adding support for both the builtin errors and your custom errors
    enum: Array.concat(Misstep.builtin_enum, custom_error_enum),
    types: Array.concat(Misstep.builtin_types, custom_error_types)
  },
  catcher: {
    catchers: {
      'validation': function(options, error){
        options.logger.warn(error);
        return this.handleOptions(options);
      }
    }
  }
});
