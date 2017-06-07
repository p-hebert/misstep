import 'babel-polyfill';
import path from 'path';
import Ajv from 'ajv';
import ajv_instanceof from 'ajv-keywords/keywords/instanceof';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';

const sandbox = sinon.sandbox.create();
const MisstepErrorStub = Error;
var Logger;

describe('Logger', function() {
  before(function() {
    mockery.enable();
    // Warning Overrides for node_modules
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-preset-stage-0/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../../node_modules/babel-plugin-transform-builtin-extend/lib/index.js'));
    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../../src/components/logger/Logger');
    mockery.registerAllowable('./options.ajv.json');
    mockery.registerAllowable('ajv');
    mockery.registerAllowable('ajv-keywords/keywords/instanceof');
    mockery.registerAllowable('./refs/json-schema-draft-06.json');
    // Register others to be replaced with stubs
    mockery.registerMock('../errors/MisstepError', MisstepErrorStub);
    // Loading module under test
    Logger = require('../../../../src/components/logger/Logger').Logger;
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('constructor', function() {
    afterEach(function() {
      sandbox.restore();
    });

    it('should call console.warn if skip_validate is passed', function(done) {
      const warnStub = sandbox.stub(console, 'warn');
      let logger = new Logger({logger: console, skip_validate: true});
      sinon.assert.calledOnce(warnStub);
      done();
    });

    it('should call console methods as default logger', function(done) {
      const consoleStub = {
        error: sandbox.stub(console, 'error'),
        warn: sandbox.stub(console, 'warn'),
        info: sandbox.stub(console, 'info'),
        log: sandbox.stub(console, 'log'),
        trace: sandbox.stub(console, 'trace')
      };
      let logger = new Logger();
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.log('info');
      logger.verbose('log');
      logger.debug('log');
      logger.silly('trace');
      sinon.assert.calledOnce(consoleStub.error);
      sinon.assert.calledOnce(consoleStub.warn);
      sinon.assert.calledTwice(consoleStub.info);
      sinon.assert.calledTwice(consoleStub.log);
      sinon.assert.calledOnce(consoleStub.trace);
      done();
    });

    it('should refuse options and throw an error', function(done) {
      try{
        let logger = new Logger({logger: {}});
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('options did not pass validation');
      }
      done();
    });

    const levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
    for(let i = 0; i < levels.length; i++){
      let level = levels[i];
      let logger = levels.reduce((acc, lvl) => {
        if(lvl === level){
          acc[lvl] = 'This is not a function';
        }else{
          acc[lvl] = () => {};
        }
        return acc;
      }, {});

      it(`should refuse invalid logger method '${level}' and throw an error`, function(done) {
        try{
          let l = new Logger({ logger: logger });
          assert.fail(false, false, 'Invalid constructor options passed validation');
        }catch(e){
          expect(e).to.be.instanceof(Error);
          expect(e.stack).to.have.string('options did not pass validation');
        }
        done();
      });
    }

    afterEach(function() {
      sandbox.restore();
    });
  });

  describe('logging methods', function() {
    it('should call each of the log methods with the proper arguments', function(done) {
      const logger = {
        error: () => {},
        warn: () => {},
        info: () => {},
        verbose: () => {},
        debug: () => {},
        silly: () => {}
      };
      const loggerStub = {
        error: sandbox.stub(logger, 'error'),
        warn: sandbox.stub(logger, 'warn'),
        info: sandbox.stub(logger, 'info'),
        verbose: sandbox.stub(logger, 'verbose'),
        debug: sandbox.stub(logger, 'debug'),
        silly: sandbox.stub(logger, 'silly')
      };

      let l = new Logger({ logger });
      l.error('error', 'error');
      l.warn('warn', 'warn');
      l.log('info', 'info');
      l.info('info', 'info');
      l.verbose('verbose', 'verbose');
      l.debug('debug', 'debug');
      l.silly('silly', 'silly');

      sinon.assert.calledOnce(loggerStub.error);
      sinon.assert.calledWith(loggerStub.error, 'error', 'error');
      sinon.assert.calledOnce(loggerStub.warn);
      sinon.assert.calledWith(loggerStub.warn, 'warn', 'warn');
      // Since log also calls info => called Twice
      sinon.assert.calledTwice(loggerStub.info);
      sinon.assert.calledWith(loggerStub.info, 'info', 'info');
      sinon.assert.calledOnce(loggerStub.verbose);
      sinon.assert.calledWith(loggerStub.verbose, 'verbose', 'verbose');
      sinon.assert.calledOnce(loggerStub.debug);
      sinon.assert.calledWith(loggerStub.debug, 'debug', 'debug');
      sinon.assert.calledOnce(loggerStub.silly);
      sinon.assert.calledWith(loggerStub.silly, 'silly', 'silly');
      done();
    });
  });
});
