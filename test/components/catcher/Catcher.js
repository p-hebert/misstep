import 'babel-polyfill';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
import path from 'path';
import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import MisstepError from '../../../src/components/errors/MisstepError';
import ResponseError from '../../../src/components/errors/ResponseError';
import ExtendedResponseError from './ExtendedResponseError';

const sandbox = sinon.sandbox.create();
const LoggerStub = function Logger() {
  this.error = () => {};
  this.warn = () => {};
  this.info = () => {};
  this.verbose = () => {};
  this.debug = () => {};
  this.silly = () => {};
};
const ExpressResponseStub = function ExpressResponseStub() {
  this.store = {};
  this.status = (status) => { this.store.status = status; return this; };
  this.json = (content) => { this.store.json = content; return this; };
};

describe('Catcher', function() {
  var Catcher;

  before(function() {
    mockery.enable();
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'))
    mockery.registerAllowable('./refs/json-schema-draft-06.json');

    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../src/components/catcher/Catcher');
    mockery.registerAllowable('./options.ajv.json');
    mockery.registerAllowable('./options.ajv.json');
    mockery.registerAllowable('./ExtendableError');
    mockery.registerAllowable('../errors/MisstepError');
    mockery.registerAllowable('../errors/ResponseError');
    // Register others to be replaced with stubs
    mockery.registerMock('../logger/Logger', LoggerStub);
    // Register modules already loaded to avoid warning for dependencies of said modules
    mockery.registerMock('ajv', Ajv);
    mockery.registerMock('ajv-keywords/keywords/instanceof', ajv_instanceof);
    // Loading module under test
    Catcher = require('../../../src/components/catcher/Catcher').default;
  });

  after(function(){
    sandbox.restore();
  });

  describe('constructor', function() {
    var logger;
    var loggerStub;

    beforeEach(function(){
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
    });

    after(function(){
      sandbox.restore();
    });

    it('should warn the user if skip_validate is passed', function(done){
      let catcher = new Catcher({logger, skip_validate: true});
      sinon.assert.calledOnce(loggerStub.warn);
      done();
    });

    it('should refuse an undefined options argument', function(done){
      try{
        let catcher = new Catcher();
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('MisstepError');
      }
      done();
    });

    it('should refuse invalid Logger instance', function(done){
      try{
        let catcher = new Catcher({logger: new Date()});
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('MisstepError');
        expect(e.payload[0].keyword).to.be.equal('instanceof');
        expect(e.payload[0].dataPath).to.be.equal('.logger');
      }
      done();
    });

    it('should refuse invalid catchers object', function(done){
      try{
        let catcher = new Catcher({logger, catchers: {}});
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('MisstepError');
        expect(e.payload[0].keyword).to.be.equal('minProperties');
        expect(e.payload[0].dataPath).to.be.equal('.catchers');
      }
      done();
    });

    it('should refuse invalid catchers callbacks', function(done){
      try{
        let catcher = new Catcher({logger, catchers: {'test': 'This is not a function'}});
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('MisstepError');
        expect(e.payload[0].keyword).to.be.equal('instanceof');
        expect(e.payload[0].dataPath).to.be.equal('.catchers[\'test\']');
      }
      done();
    });

    it('should add default catchers to the Catcher instance', function(done) {
      let catcher = new Catcher({logger});
      expect(catcher.catchers).to.be.an('object');
      if(typeof catcher.catchers === 'object'){
        expect(catcher.catchers.names).to.include('barebone');
        expect(catcher.catchers.names).to.include('response');
      }
      done();
    });

    it('should add custom catchers to the Catcher instance', function(done) {
      let spycb = sinon.spy();
      let catcher = new Catcher({logger, catchers: {'test': spycb}});
      expect(catcher.catchers).to.be.an('object');
      if(typeof catcher.catchers === 'object'){
        expect(catcher.catchers.names).to.include('test');
        expect(catcher.catchers.callbacks['test']).to.be.equal(spycb);
      }
      done();
    });
  });

  describe('handleOptions', function() {
    var logger;
    var loggerStub;
    var catcher;

    before(function() {
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
      catcher = new Catcher({logger});
    });

    after(function(){
      sandbox.restore();
    });

    it('should return undefined by default', function(done) {
      expect(catcher.handleOptions(undefined, new Error())).to.be.undefined;
      done();
    });

    it('should throw if asked so', function(done) {
      try{
        catcher.handleOptions({throw: true}, new Error());
        assert.fail(false, false, 'catcher.handleOptions should have thrown');
      }catch(e){
        expect(e).to.be.instanceof(Error);
      }
      done();
    });

    it('should return a rejected Promise if asked so', function(done) {
      let p = catcher.handleOptions({reject: true}, new Error());
      expect(p).to.be.instanceof(Promise);
      if(p instanceof Promise){
        p.then((e) => {
          done(new Error('catcher.handleOptions Promise resolved'));
        }).catch(() => {
          done();
        });
      }else{
        done();
      }
    });

    it('should return a resolved Promise if asked so', function(done) {
      let p = catcher.handleOptions({resolve: true}, new Error());
      expect(p).to.be.instanceof(Promise);
      if(p instanceof Promise){
        p.then(() => {
          done();
        }).catch(() => {
          done(new Error('catcher.handleOptions Promise rejected'));
        });
      }else{
        done();
      }
    });

    it('should return the error if asked so', function(done) {
      let e = new Error();
      expect(catcher.handleOptions({return: true}, e)).to.be.equal(e);
      done();
    });
  });

  describe('barebone', function() {
    var catcher;
    var logger;
    var loggerStub;

    before(function() {
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
      catcher = new Catcher({logger});
    });

    after(function() {
      sandbox.restore();
    });

    it('should log error to logger.error', function(done) {
      catcher.barebone({}, new Error());
      sinon.assert.calledOnce(loggerStub.error);
      done();
    });

    it('should call handleOptions', function(done) {
      let hospy = sinon.spy(catcher, 'handleOptions');
      catcher.barebone({}, new Error());
      sinon.assert.calledOnce(hospy);
      hospy.restore();
      done();
    });
  });

  describe('response', function() {
    var catcher;
    var logger;
    var loggerStub;

    before(function() {
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
      catcher = new Catcher({logger});
    });

    after(function() {
      sandbox.restore();
    });

    it('should log error to logger.error', function(done) {
      catcher.response({}, new ExpressResponseStub(), new Error());
      sinon.assert.calledOnce(loggerStub.error);
      done();
    });

    it('should send a ResponseError serialization if passed a ResponseError as err', function(done) {
      let res = new ExpressResponseStub();
      let err = new ExtendedResponseError({status: 404, type: 'RESPONSE:DEFAULT:TEST', message: 'test message', payload: 'test payload'});
      expect(err).to.be.instanceof(ResponseError);
      catcher.response({}, res, err);
      expect(res.store.json.status).to.be.equal(err.status);
      expect(res.store.json.type).to.be.equal(err.type);
      expect(res.store.json.message).to.be.equal(err.message);
      expect(res.store.json.payload).to.be.equal(err.payload);
      done();
    });

    it('should send a default ResponseError serialization with err as payload if passed a non-ResponseError', function(done) {
      let res = new ExpressResponseStub();
      let err = {status: 404, error: 'test error'};
      catcher.response({}, res, err);
      expect(res.store.json.status).to.be.equal(err.status);
      expect(res.store.json.type).to.be.equal('RESPONSE:DEFAULT:ERROR');
      expect(res.store.json.payload.status).to.be.equal(err.status);
      expect(res.store.json.payload.error).to.be.equal(err.error);
      done();
    });

    it('should send a default ResponseError serialization with err as payload if passed a non-object', function(done) {
      let res = new ExpressResponseStub();
      let err = 'test string error';
      catcher.response({}, res, err);
      expect(res.store.json.status).to.be.equal(500);
      expect(res.store.json.type).to.be.equal('RESPONSE:DEFAULT:ERROR');
      expect(res.store.json.payload).to.be.equal(err);
      done();
    });
  });

  describe('catcher', function() {
    var logger;
    var loggerStub;

    beforeEach(function(){
      logger = new LoggerStub();
      loggerStub = {
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should call the barebone callback by default', function(done) {
      let catcher = new Catcher({logger});
      let barebonespy = sinon.spy(catcher, 'barebone');
      catcher.catcher({})();
      catcher.catcher({type: 'unbound callback'})();
      sinon.assert.calledTwice(barebonespy);
      done();
    });

    it('should return the added catcher callback', function(done) {
      let spycb = sinon.spy();
      let catcher = new Catcher({logger, catchers: {'test': spycb}});
      catcher.catcher({type: 'test'})();
      sinon.assert.calledOnce(spycb);
      done();
    });

    it('should return the overriden response/barebone catcher callbacks', function(done) {
      let barebonestub = sinon.stub();
      let responsestub = sinon.stub();
      let catcher = new Catcher({logger, catchers: {'barebone': barebonestub, 'response': responsestub}});
      // Testing default to barebone
      catcher.catcher({})();
      // Testing direct calls to callbacks
      catcher.catcher({type: 'barebone'})();
      catcher.catcher({type: 'response'})();
      sinon.assert.calledTwice(barebonestub);
      sinon.assert.calledOnce(responsestub);
      done();
    });

    it('should refuse a function as a parameter', function(done) {
      let catcher = new Catcher({logger});
      try{
        catcher.catcher(() => {});
        assert.fail(false, false, 'Should have refused the passed function');
      }catch(e){
        expect(e).to.be.instanceof(MisstepError);
        expect(`${e.stack}`).to.have.string('Cannot pass a function');
      }
      done();
    });

    it('should bind non-array arguments', function(done) {
      let catcher = new Catcher({logger});
      let barebonespy = sinon.spy(catcher, 'barebone');
      let options = {};
      let bind = 'hello';
      catcher.catcher({options: options, bind: bind})();
      expect(barebonespy.args[0][1]).to.be.equal('hello');
      done();
    });

    it('should bind arguments from an array', function(done) {
      let catcher = new Catcher({logger});
      let barebonespy = sinon.spy(catcher, 'barebone');
      let options = {};
      let bind = ['hello', 'world'];
      catcher.catcher({options: options, bind: bind})();
      expect(barebonespy.args[0][1]).to.be.equal('hello');
      expect(barebonespy.args[0][2]).to.be.equal('world');
      done();
    });

    it('should bind arguments from an array-like', function(done) {
      let catcher = new Catcher({logger});
      let barebonespy = sinon.spy(catcher, 'barebone');
      let options = {};
      // Getting arguments from a function
      const argscb = function() { return arguments; };
      let bind = argscb('hello', 'world');
      catcher.catcher({options: options, bind: bind})();
      expect(barebonespy.args[0][1]).to.be.equal('hello');
      expect(barebonespy.args[0][2]).to.be.equal('world');
      done();
    });
  });
});
