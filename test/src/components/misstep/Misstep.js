import 'babel-polyfill';
import path from 'path';
import sinon from 'sinon';
import mockery from 'mockery';

const sandbox = sinon.sandbox.create();
const LoggerStub = function LoggerStub() {
  return {
    error: sinon.stub(),
    warn: sinon.stub(),
    info: sinon.stub(),
    verbose: sinon.stub(),
    debug: sinon.stub(),
    silly: sinon.stub()
  };
};
const CatcherStub = function Catcher() {
  this.catcher = sinon.stub();
};
const BuilderStub = function Builder() {
  this.construct = sinon.stub();
};


describe('Misstep', function(){
  const LoggerProxy = function Logger(){
    this.error = function() { logger.error.apply(logger, arguments); };
    this.warn = function() { logger.warn.apply(logger, arguments); };
    this.info = function() { logger.info.apply(logger, arguments); };
    this.verbose = function() { logger.verbose.apply(logger, arguments); };
    this.debug = function() { logger.debug.apply(logger, arguments); };
    this.silly = function() { logger.silly.apply(logger, arguments); };
  };

  var logger;
  var Misstep;

  before(function() {
    mockery.enable();
    mockery.warnOnReplace(false);
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'));
    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../../src/components/misstep/Misstep');
    // Register others to be replaced with stubs
    mockery.registerMock('../logger/Logger', { Logger: LoggerProxy, logger });
    mockery.registerMock('../catcher/Catcher', CatcherStub);
    mockery.registerMock('../builder/Builder', BuilderStub);
    // Loading module under test
  });

  after(function(){
    mockery.disable();
    sandbox.restore();
  });

  describe('constructor', function() {
    beforeEach(function(){
      logger = new LoggerStub();
      mockery.registerMock('../logger/Logger', { Logger: LoggerProxy, logger });
      Misstep = require('../../../../src/components/misstep/Misstep').default;
    });

    afterEach(function(){
      sandbox.restore();
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
  });
});
