import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
import path from 'path';
import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import ExtendableError from '../../../../../src/components/errors/ExtendableError';
import DefaultError from '../../../../../src/components/errors/DefaultError';
import builtin_errors from '../../../../../src/components/errors/builtins/errors';
import builtin_enum from '../../../../../src/components/errors/builtins/enum.json';

const sandbox = sinon.sandbox.create();
const LoggerStub = function Logger() {
  this.error = () => {};
  this.warn = () => {};
  this.info = () => {};
  this.verbose = () => {};
  this.debug = () => {};
  this.silly = () => {};
};

describe('built-in errors', function(){
  var Builder;
  var logger;

  before(function(done) {
    mockery.enable();
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../../../node_modules/babel-plugin-istanbul/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'));
    mockery.registerAllowable('./refs/json-schema-draft-06.json');

    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../../../src/components/builder/Builder');
    mockery.registerAllowable('./options.ajv.json');
    mockery.registerAllowable('../../utilities/ajv-keywords/subclassof.js');
    mockery.registerAllowable('../ExtendableError');
    mockery.registerAllowable('../DefaultError');
    mockery.registerAllowable('../errors/DefaultError');
    mockery.registerAllowable('../errors/ExtendableError');
    mockery.registerAllowable('../errors/defaults/errors.js');
    mockery.registerAllowable('../errors/defaults/enum.json');

    // Register others to be replaced with stubs
    mockery.registerMock('../logger/Logger', { Logger: LoggerStub, logger: undefined });
    mockery.registerMock('../errors/MisstepError', ExtendableError);
    mockery.registerMock('../MisstepError', ExtendableError);
    mockery.registerMock('../ResponseError', ExtendableError);
    // Register modules already loaded to avoid warning for dependencies of said modules
    mockery.registerMock('ajv', Ajv);
    mockery.registerMock('ajv-keywords/keywords/instanceof', ajv_instanceof);
    mockery.registerAllowable('../ExtendableError');
    // Loading module under test
    Builder = require('../../../../../src/components/builder/Builder').default;
    done();
  });

  beforeEach(function(done){
    logger = new LoggerStub();
    done();
  });

  after(function(done){
    sandbox.restore();
    mockery.deregisterAll();
    mockery.disable();
    done();
  });

  it('should hydrate all built-in errors', function(done){
    const errors = [
      {type: 'ECMASCRIPT:BUILTIN:RANGE_ERROR', '$constructor': RangeError},
      {type: 'ECMASCRIPT:BUILTIN:REFERENCE_ERROR', '$constructor': ReferenceError},
      {type: 'ECMASCRIPT:BUILTIN:SYNTAX_ERROR', '$constructor': SyntaxError},
      {type: 'ECMASCRIPT:BUILTIN:TYPE_ERROR', '$constructor': TypeError},
      {type: 'ECMASCRIPT:BUILTIN:URI_ERROR', '$constructor': URIError}
    ];
    let builder = new Builder({logger, enum: builtin_enum, types: builtin_errors, skip_validate: true});
    for(let i = 0; i < errors.length; i++){
      let err = builder.construct({type: errors[i].type, payload: 'test_payload', message: 'test_message'});
      expect(err).to.be.instanceof(errors[i].$constructor);
      expect(err.type).to.be.equal(errors[i].type);
      expect(err.payload).to.be.equal('test_payload');
      expect(err.message).to.be.equal('test_message');
    }
    done();
  });

  it('should hydrate a DefaultError given an incomplete or invalid type', function(done){
    const builder = new Builder({logger, enum: builtin_enum, types: builtin_errors, skip_validate: true});
    let err = builder.construct({type: 'ECMASCRIPT:BUILTIN', payload: 'test_payload', message: 'test_message'});
    expect(err).to.be.instanceof(DefaultError);
    expect(err.type).to.be.equal('ECMASCRIPT:BUILTIN');
    expect(err.payload).to.be.equal('test_payload');
    expect(err.message).to.be.equal('test_message');
    done();
  });
});
