import Misstep from './components/misstep/Misstep';
import Builder from './components/builder/Builder';
import Catcher from './components/catcher/Catcher';
import { Logger, logger } from './components/logger/Logger';
import ExtendableError from './components/errors/ExtendableError';
import DefaultError from './components/errors/DefaultError';
import ResponseError from './components/errors/ResponseError';
import builtin_types from './components/errors/builtins/errors';
import builtin_enum from './components/errors/builtins/enum.json';

const MisstepWrapper = function MisstepWrapper(options) {
  return new Misstep(options);
};

MisstepWrapper.Builder = Builder;
MisstepWrapper.Catcher = Catcher;
MisstepWrapper.Logger = Logger;
MisstepWrapper.logger = logger;
MisstepWrapper.ExtendableError = ExtendableError;
MisstepWrapper.DefaultError = DefaultError;
MisstepWrapper.ResponseError = ResponseError;
MisstepWrapper.builtin_types = builtin_types;
MisstepWrapper.builtin_enum = builtin_enum;

module.exports = MisstepWrapper;
