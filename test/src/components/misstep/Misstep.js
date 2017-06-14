import 'babel-polyfill';
import path from 'path';
import sinon from 'sinon';
import mockery from 'mockery';
import { expect } from 'chai';

const sandbox = sinon.sandbox.create();
const LoggerStub = function LoggerStub() {
  return {
    error: sandbox.stub(),
    warn: sandbox.stub(),
    info: sandbox.stub(),
    verbose: sandbox.stub(),
    debug: sandbox.stub(),
    silly: sandbox.stub()
  };
};
const CatcherStub = function Catcher() {
  this.catcher = sinon.stub();
  this.args = Array.from(arguments);
};
const BuilderStub = function Builder() {
  this.construct = sinon.stub();
  this.args = Array.from(arguments);
};


describe('Misstep', function(){
  const LoggerProxy = function Logger(){
    this.args = Array.from(arguments);
    this.error = function() { logger.error.apply(logger, arguments); };
    this.warn = function() { logger.warn.apply(logger, arguments); };
    this.info = function() { logger.info.apply(logger, arguments); };
    this.verbose = function() { logger.verbose.apply(logger, arguments); };
    this.debug = function() { logger.debug.apply(logger, arguments); };
    this.silly = function() { logger.silly.apply(logger, arguments); };
  };

  var logger;
  var Misstep;

  before(function(done) {
    mockery.enable();
    mockery.warnOnReplace(false);
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-istanbul/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'));
    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../../src/components/misstep/Misstep');
    // Register others to be replaced with stubs
    mockery.registerMock('../logger/Logger', { Logger: LoggerProxy, logger });
    mockery.registerMock('../catcher/Catcher', CatcherStub);
    mockery.registerMock('../builder/Builder', BuilderStub);
    done();
  });

  after(function(done){
    mockery.disable();
    sandbox.restore();
    done();
  });

  describe('constructor', function() {
    beforeEach(function(done){
      logger = new LoggerStub();
      mockery.registerMock('../logger/Logger', { Logger: LoggerProxy, logger });
      Misstep = require('../../../../src/components/misstep/Misstep').default;
      done();
    });

    afterEach(function(done){
      sandbox.restore();
      done();
    });

    it('should warn the user if skip_validate is passed', function(done){
      let misstep = new Misstep({skip_validate: true});
      sinon.assert.calledOnce(logger.warn);
      done();
    });

    it('should not warn the user if skip_validate is passed and no_warn is passed', function(done){
      let misstep = new Misstep({skip_validate: true, no_warn: true});
      sinon.assert.notCalled(logger.warn);
      done();
    });

    it('should pass a no-warn to the components if skip_validate is passed and no component-specific options is passed', function(done){
      let misstep = new Misstep({skip_validate: true, no_warn: true});
      expect(misstep.instances.builder.args[0]).to.be.an('object').that.includes.keys('no_warn', 'skip_validate');
      expect(misstep.instances.builder.args[0].skip_validate).to.be.true;
      expect(misstep.instances.builder.args[0].no_warn).to.be.true;
      expect(misstep.instances.catcher.args[0]).to.be.an('object').that.includes.keys('no_warn', 'skip_validate');
      expect(misstep.instances.catcher.args[0].skip_validate).to.be.true;
      expect(misstep.instances.catcher.args[0].no_warn).to.be.true;
      expect(misstep.instances.logger.args[0]).to.be.an('object').that.includes.keys('no_warn', 'skip_validate');
      expect(misstep.instances.logger.args[0].skip_validate).to.be.true;
      expect(misstep.instances.logger.args[0].no_warn).to.be.true;
      sinon.assert.notCalled(logger.warn);
      done();
    });

    it('should bind the instance of Catcher, Builder and Logger to the instance', function(done){
      let misstep = new Misstep({skip_validate: true, no_warn: true});
      misstep.instances.logger.info();
      sinon.assert.calledOnce(logger.info);
      misstep.catcher();
      sinon.assert.calledOnce(misstep.instances.catcher.catcher);
      misstep.builder();
      sinon.assert.calledOnce(misstep.instances.builder.construct);
      done();
    });

    it('should pass the given arguments to the component constructors', function(done){
      let misstep = new Misstep({
        skip_validate: true,
        no_warn: false,
        logger: {test_logger: 'test', no_warn: false },
        catcher: {test_catcher: 'test', no_warn: false },
        builder: {test_builder: 'test', no_warn: false }
      });
      expect(misstep.instances.builder.args[0]).to.be.an('object').that.includes.keys('test_builder');
      expect(misstep.instances.builder.args[0].test_builder).to.be.equal('test');
      expect(misstep.instances.builder.args[0].no_warn).to.be.false;
      expect(misstep.instances.catcher.args[0]).to.be.an('object').that.includes.keys('test_catcher');
      expect(misstep.instances.catcher.args[0].test_catcher).to.be.equal('test');
      expect(misstep.instances.catcher.args[0].no_warn).to.be.false;
      expect(misstep.instances.logger.args[0]).to.be.an('object').that.includes.keys('test_logger');
      expect(misstep.instances.logger.args[0].test_logger).to.be.equal('test');
      expect(misstep.instances.logger.args[0].no_warn).to.be.false;
      sinon.assert.calledOnce(logger.warn);
      done();
    });

    it('should have each component\'s no_warn to be true by default even if top level no_warn is false', function(done){
      let misstep = new Misstep({
        skip_validate: true,
        no_warn: false,
        logger: {},
        catcher: {},
        builder: {}
      });
      expect(misstep.instances.builder.args[0]).to.be.an('object').that.includes.keys('no_warn');
      expect(misstep.instances.builder.args[0].no_warn).to.be.true;
      expect(misstep.instances.catcher.args[0]).to.be.an('object').that.includes.keys('no_warn');
      expect(misstep.instances.catcher.args[0].no_warn).to.be.true;
      expect(misstep.instances.logger.args[0]).to.be.an('object').that.includes.keys('no_warn');
      expect(misstep.instances.logger.args[0].no_warn).to.be.true;
      sinon.assert.calledOnce(logger.warn);
      done();
    });

    it('should instantiate the logger with the proper options.logger', function(done){
      let misstep = new Misstep({logger: {test_logger: 'test'}});
      expect(misstep.instances.logger.args[0]).to.be.an('object').that.includes.keys('test_logger');
      expect(misstep.instances.logger.args[0].test_logger).to.be.equal('test');
      done();
    });

    it('should instantiate the logger with the default logger if not given a parameter', function(done){
      let misstep = new Misstep();
      misstep.instances.logger.info();
      sinon.assert.calledOnce(logger.info);
      done();
    });
  });
});
