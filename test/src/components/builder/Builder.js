import 'babel-polyfill';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
import path from 'path';
import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import ExtendableError from '../../../../src/components/errors/ExtendableError';
import DefaultError from '../../../../src/components/errors/DefaultError';
import MisstepError from '../../../../src/components/errors/MisstepError';
import ResponseError from '../../../../src/components/errors/ResponseError';
import TestError from './TestError';
import format_enum from './test-data/constructor/format_enum.json';
import description_enum from './test-data/constructor/description_enum.json';
import status_enum from './test-data/constructor/status_enum.json';
import no_sub_enum from './test-data/constructor/no_sub_enum.json';
import no_detailed_enum from './test-data/constructor/no_detailed_enum.json';
import default_enum from './test-data/default/enum.json';

const sandbox = sinon.sandbox.create();
const LoggerStub = function Logger() {
  this.error = () => {};
  this.warn = () => {};
  this.info = () => {};
  this.verbose = () => {};
  this.debug = () => {};
  this.silly = () => {};
};

describe('Builder', function(){
  var Builder;

  before(function(done) {
    mockery.enable();
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-istanbul/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'));
    mockery.registerAllowable('./refs/json-schema-draft-06.json');

    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../../src/components/builder/Builder');
    mockery.registerAllowable('./options.ajv.json');
    mockery.registerAllowable('../../utilities/ajv-keywords/subclassof.js');
    mockery.registerAllowable('../ExtendableError');
    mockery.registerAllowable('../DefaultError');
    mockery.registerAllowable('../MisstepError');
    mockery.registerAllowable('../ResponseError');
    mockery.registerAllowable('../errors/DefaultError');
    mockery.registerAllowable('../errors/ExtendableError');
    mockery.registerAllowable('../errors/MisstepError');
    mockery.registerAllowable('../errors/ResponseError');
    mockery.registerAllowable('../errors/defaults/errors.js');
    mockery.registerAllowable('../errors/defaults/enum.json');

    // Register others to be replaced with stubs
    mockery.registerMock('../logger/Logger', { Logger: LoggerStub, logger: undefined });
    // Register modules already loaded to avoid warning for dependencies of said modules
    mockery.registerMock('ajv', Ajv);
    mockery.registerMock('ajv-keywords/keywords/instanceof', ajv_instanceof);
    // Loading module under test
    Builder = require('../../../../src/components/builder/Builder').default;
    done();
  });

  after(function(done){
    sandbox.restore();
    mockery.deregisterAll();
    mockery.disable();
    done();
  });

  describe('constructor', function() {
    var logger;
    var loggerStub;

    beforeEach(function(done){
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
      done();
    });

    after(function(done){
      sandbox.restore();
      done();
    });

    it('should warn the user if skip_validate is passed', function(done){
      let builder = new Builder({logger, skip_validate: true});
      sinon.assert.calledOnce(loggerStub.warn);
      done();
    });

    it('should refuse an undefined options argument', function(done){
      try_catcher(done, undefined, (e) => {
        expect(e).to.be.instanceof(MisstepError);
      });
    });

    it('should refuse invalid Logger instance', function(done){
      try_catcher(done, {logger: new Date()}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('instanceof');
        expect(e.payload[0].dataPath).to.be.equal('.logger');
      });
    });

    it('should refuse empty types', function(done) {
      try_catcher(done, {logger, types: []}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('minItems');
        expect(e.payload[0].dataPath).to.be.equal('.types');
      });
    });

    it('should refuse invalid type $constructor keys', function(done) {
      try_catcher(done, {logger, types: [ { key: null, $constructor: () => {} } ]}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('type');
        expect(e.payload[0].dataPath).to.be.equal('.types[0].key');
      });
    });

    it('should refuse invalid type $constructors', function(done) {
      const constructor = function Constructor(){};
      try_catcher(done, {logger, types: [ { key: 'test', $constructor: constructor } ]}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('subclassof');
        expect(e.payload[0].dataPath).to.be.equal('.types[0].$constructor');
      });
    });

    it('should refuse invalid type callback keys', function(done) {
      try_catcher(done, {logger, types: [ { key: null, callback: () => {} } ]}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[1].keyword).to.be.equal('type');
        expect(e.payload[1].dataPath).to.be.equal('.types[0].key');
      });
    });

    it('should refuse invalid type callbacks', function(done) {
      try_catcher(done, {logger, types: [ { key: 'test', callback: 'this is not a callback' } ]}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[1].keyword).to.be.equal('instanceof');
        expect(e.payload[1].dataPath).to.be.equal('.types[0].callback');
      });
    });

    it('should refuse invalid type keys that do not have a callback or $constructor', function(done) {
      try_catcher(done, {logger, types: [ { key: 'test' } ]}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('required');
        expect(e.payload[0].dataPath).to.be.equal('.types[0]');
        expect(e.payload[1].keyword).to.be.equal('required');
        expect(e.payload[1].dataPath).to.be.equal('.types[0]');
      });
    });

    it('should refuse empty enum', function(done) {
      try_catcher(done, {logger, enum: []}, (e) => {
        expect(e).to.be.instanceof(MisstepError);
        expect(e.payload[0].keyword).to.be.equal('minItems');
        expect(e.payload[0].dataPath).to.be.equal('.enum');
      });
    });

    it('should refuse enum category with invalid name', function(done) {
      for(let i = 0; i < format_enum.length; i++){
        let d = i + 1 === format_enum.length ? done : () => {};
        let check;
        if(format_enum[i].name === undefined){
          check = 'required';
        }else if(typeof format_enum[i].name !== 'string'){
          check = 'type';
        }else{
          check = 'pattern';
        }
        try_catcher(d, {logger, enum: [format_enum[i]]}, (e) => {
          expect(e).to.be.instanceof(MisstepError);
          expect(e.payload[0].keyword).to.be.equal(check);
          expect(e.payload[0].dataPath).to.be.equal(`.enum[0]${check === 'required' ? '' : '.name'}`);
        });
      }
    });

    it('should refuse enum category with invalid description type', function(done) {
      for(let i = 0; i < description_enum.length; i++){
        let d = i + 1 === description_enum.length ? done : () => {};
        let check;
        if(description_enum[i].description === undefined){
          check = 'required';
        }else if(typeof description_enum[i].description !== 'string'){
          check = 'type';
        }
        try_catcher(d, {logger, enum: [description_enum[i]]}, (e) => {
          expect(e).to.be.instanceof(MisstepError);
          expect(e.payload[0].keyword).to.be.equal(check);
          expect(e.payload[0].dataPath).to.be.equal(`.enum[0]${check === 'required' ? '' : '.description'}`);
        });
      }
    });

    it('should refuse enum category with invalid status value', function(done) {
      for(let i = 0; i < status_enum.length; i++){
        let d = i + 1 === status_enum.length ? done : () => {};
        try_catcher(d, {logger, enum: [status_enum[i]]}, (e) => {
          expect(e).to.be.instanceof(MisstepError);
          expect(e.payload[0].keyword).to.be.equal('enum');
          expect(e.payload[0].dataPath).to.be.equal('.enum[0].status');
        });
      }
    });

    it('should refuse enum category with no children', function(done) {
      for(let i = 0; i < no_sub_enum.length; i++){
        let d = i + 1 === no_sub_enum.length ? done : () => {};
        let check;
        if(no_sub_enum[i].children === undefined){
          check = 'required';
        }else{
          check = 'minItems';
        }
        try_catcher(d, {logger, enum: [no_sub_enum[i]]}, (e) => {
          expect(e).to.be.instanceof(MisstepError);
          expect(e.payload[0].keyword).to.be.equal(check);
          expect(e.payload[0].dataPath).to.be.equal(`.enum[0]${check === 'required' ? '' : '.children'}`);
        });
      }
    });

    it('should refuse enum subcategory item with no children', function(done) {
      for(let i = 0; i < no_detailed_enum.length; i++){
        let d = i + 1 === no_detailed_enum.length ? done : () => {};
        let check;
        if(no_detailed_enum[i].children[0].children === undefined){
          check = 'required';
        }else{
          check = 'minItems';
        }
        try_catcher(d, {logger, enum: [no_detailed_enum[i]]}, (e) => {
          expect(e).to.be.instanceof(MisstepError);
          expect(e.payload[0].keyword).to.be.equal(check);
          expect(e.payload[0].dataPath).to.be.equal(`.enum[0].children[0]${check === 'required' ? '' : '.children'}`);
        });
      }
    });
  });

  describe('parseErrorType', function() {
    var logger;

    beforeEach(function(done){
      logger = new LoggerStub();
      done();
    });

    after(function(done){
      sandbox.restore();
      done();
    });

    it('should return a valid type given a valid string and an existing entry in the default enum', function(done){
      let builder = new Builder({logger});
      let type = builder.parseErrorType('RESPONSE:DEFAULT:ERROR');
      expect(type.valid).to.be.true;
      expect(type.category.name).to.be.equal('RESPONSE');
      expect(type.subcategory.name).to.be.equal('DEFAULT');
      expect(type.detailed.name).to.be.equal('ERROR');
      done();
    });

    it('should return a valid type given a valid string and an existing entry in the custom enum', function(done){
      let builder = new Builder({logger, enum: default_enum});
      let type = builder.parseErrorType('TEST:DEFAULT:ERROR');
      expect(type.valid).to.be.true;
      expect(type.category.name).to.be.equal('TEST');
      expect(type.subcategory.name).to.be.equal('DEFAULT');
      expect(type.detailed.name).to.be.equal('ERROR');
      done();
    });

    it('should return an invalid type given there is no such entry in enum', function(done){
      let builder = new Builder({logger});
      let type = builder.parseErrorType('TEST:NOT_LISTED:ERROR');
      expect(type.valid).to.be.false;
      expect(type.category).to.be.undefined;
      expect(type.subcategory).to.be.undefined;
      expect(type.detailed).to.be.undefined;
      done();
    });

    it('should return an invalid but partially complete type given an incomplete type string', function(done){
      let builder = new Builder({logger});
      let type = builder.parseErrorType('RESPONSE:DEFAULT');
      expect(type.valid).to.be.false;
      expect(type.category.name).to.be.equal('RESPONSE');
      expect(type.subcategory.name).to.be.equal('DEFAULT');
      expect(type.detailed).to.be.undefined;
      done();
    });
  });

  describe('getErrorCallback', function() {
    var logger;

    beforeEach(function(done){
      logger = new LoggerStub();
      done();
    });

    after(function(done){
      sandbox.restore();
      done();
    });

    it('should return the proper callback given a valid type', function(done){
      let callback = sinon.spy();
      let builder = new Builder({logger, enum: default_enum, types: [{key: 'TEST', callback}]});
      let type = {
        category: {name: 'TEST'},
        subcategory: {name: 'DEFAULT'},
        detailed: {name: 'ERROR'}
      };
      builder.getErrorCallback(type)();
      sinon.assert.calledOnce(callback);
      done();
    });

    it('should return null if the callback cannot be found', function(done){
      let builder = new Builder({logger});
      expect(builder.getErrorCallback({})).to.be.null;
      done();
    });
  });

  describe('getErrorConstructor', function() {
    var logger;

    beforeEach(function(done){
      logger = new LoggerStub();
      done();
    });

    after(function(done){
      sandbox.restore();
      done();
    });

    it('should return the proper constructor given a valid constructor function', function(done){
      let builder = new Builder({logger, types: [ { key: 'TEST', $constructor: TestError } ]});
      let type = {
        valid: true,
        category: {name: 'TEST'},
        subcategory: {name: 'DEFAULT'},
        detailed: {name: 'ERROR'}
      };
      let err = new (builder.getErrorConstructor(type))();
      expect(err).to.be.instanceof(TestError);
      done();
    });

    it('should return the proper constructor given a valid type', function(done){
      let builder = new Builder({logger});
      let type = {
        valid: true,
        category: {name: 'RESPONSE'},
        subcategory: {name: 'DEFAULT'},
        detailed: {name: 'ERROR'}
      };
      let err = new (builder.getErrorConstructor(type))({message: 'test'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.message).to.be.equal('test');
      done();
    });

    it('should return the proper constructor given an incomplete but existing type', function(done){
      let builder = new Builder({logger});
      let type = {
        valid: false,
        category: {name: 'RESPONSE'}
      };
      let err = new (builder.getErrorConstructor(type))({message: 'test'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.message).to.be.equal('test');
      done();
    });

    it('should return a constructor building a DefaultError if the constructor cannot be found', function(done){
      let builder = new Builder({logger});
      let err = new (builder.getErrorConstructor({}))({message: 'test'});
      expect(err).to.be.instanceof(DefaultError);
      expect(err.message).to.be.equal('test');
      done();
    });
  });

  describe('construct', function() {
    var logger;

    beforeEach(function(done){
      logger = new LoggerStub();
      done();
    });

    after(function(done){
      sandbox.restore();
      done();
    });

    it('should return a fallback DefaultError if the error provided is not an object', function(done){
      let builder = new Builder({logger});
      let err = builder.construct(null);
      expect(err).to.be.instanceof(DefaultError);
      expect(err.type).to.be.equal('DEFAULT:FALLBACK:ERROR');
      expect(err.payload).to.be.equal(null);
      err = builder.construct(true);
      expect(err).to.be.instanceof(DefaultError);
      expect(err.type).to.be.equal('DEFAULT:FALLBACK:ERROR');
      expect(err.payload).to.be.true;
      done();
    });

    it('should return a fallback DefaultError if the type provided is not a string', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 0, payload: 'test_payload', message: 'test_message'});
      expect(err).to.be.instanceof(DefaultError);
      expect(err.type).to.be.equal('DEFAULT:FALLBACK:ERROR');
      expect(err.message).to.be.equal('test_message');
      expect(err.payload).to.be.equal('test_payload');
      done();
    });

    it('should return a properly hydrated error object given a proper type', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'RESPONSE:DEFAULT:ERROR', status: 400, payload: 'test_payload', message: 'test_message'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.message).to.be.equal('test_message');
      expect(err.payload).to.be.equal('test_payload');
      expect(err.status).to.be.equal(400);
      done();
    });

    it('should return the default message and status if only type is provided', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'RESPONSE:DEFAULT:ERROR'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.status).to.be.equal(500);
      expect(err.message).to.be.equal('This error is a fatal error that has not been categorized. See payload for more information');
      done();
    });

    it('should return a properly hydrated error given an incomplete but sufficient type (category only)', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'DEFAULT', payload: 'test_payload'});
      expect(err).to.be.instanceof(DefaultError);
      expect(err.message).to.be.equal('Default Misstep extended error');
      expect(err.payload).to.be.equal('test_payload');
      done();
    });

    it('should return a properly hydrated error given an incomplete but sufficient type (category and subcategory)', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'RESPONSE:DEFAULT', payload: 'test_payload'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.status).to.be.equal(500);
      expect(err.type).to.be.equal('RESPONSE:DEFAULT');
      expect(err.message).to.be.equal('Default response error');
      expect(err.payload).to.be.equal('test_payload');
      done();
    });

    it('should return a properly hydrated error given a complete but unlisted type (subcategory)', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'RESPONSE:UNLISTED:ERROR', payload: 'test_payload'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.status).to.be.equal(500);
      expect(err.type).to.be.equal('RESPONSE');
      expect(err.message).to.be.equal('Response error');
      expect(err.payload).to.be.equal('test_payload');
      done();
    });

    it('should return a properly hydrated error given a complete but unlisted type (detailed)', function(done){
      let builder = new Builder({logger});
      let err = builder.construct({type: 'RESPONSE:DEFAULT:UNLISTED', payload: 'test_payload'});
      expect(err).to.be.instanceof(ResponseError);
      expect(err.status).to.be.equal(500);
      expect(err.type).to.be.equal('RESPONSE:DEFAULT');
      expect(err.message).to.be.equal('Default response error');
      expect(err.payload).to.be.equal('test_payload');
      done();
    });

    it('should call a callback given that a callback has been set for the type category', function(done){
      let callback = sinon.spy();
      let builder = new Builder({logger, enum: default_enum, types: [{key: 'TEST', callback}]});
      builder.construct({type: 'TEST:DEFAULT:ERROR', payload: ''});
      sinon.assert.calledOnce(callback);
      done();
    });
  });

  function try_catcher(done, args, assertions){
    try{
      let builder = new Builder(args);
      done(new Error('Invalid constructor options passed validation'));
    }catch(e){
      assertions(e);
      done();
    }
  }
});
