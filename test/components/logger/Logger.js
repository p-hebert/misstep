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
    mockery.registerAllowable(path.join(__dirname, '../../../node_modules/babel-preset-es2015/lib/index.js'));
    mockery.registerAllowable(path.join(__dirname, '../../../node_modules/babel-preset-stage-0/lib/index.js'));
    // Allow modules to be loaded normally
    mockery.registerAllowable('../../../src/components/logger/Logger');
    mockery.registerAllowable('./options.ajv.json');
    // Register others to be replaced with stubs
    mockery.registerMock('../errors/MisstepError', MisstepErrorStub);
    // Register modules already loaded to avoid warning for dependencies of said modules
    mockery.registerMock('ajv', Ajv);
    mockery.registerMock('ajv-keywords/keywords/instanceof', ajv_instanceof);
    // Loading module under test
    Logger = require('../../../src/components/logger/Logger').default;
  });

  describe('constructor', function() {
    it('should call console.warn if skip_validate is passed', function(done) {
      const warnStub = sinon.stub(console, 'warn');
      let logger = new Logger({logger: console, skip_validate: true});
      sinon.assert.calledOnce(warnStub);
      done();
    });

    it('should refuse options and throw an error', function(done) {
      try{
        let logger = new Logger({logger: {}});
        assert.fail(false, false, 'Invalid constructor options passed validation');
      }catch(e){
        expect(e).to.be.instanceof(Error);
        expect(e.stack).to.have.string('MisstepError');
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
          expect(e.stack).to.have.string('MisstepError');
        }
        done();
      });
    }

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
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn'),
        info: sinon.stub(logger, 'info'),
        verbose: sinon.stub(logger, 'verbose'),
        debug: sinon.stub(logger, 'debug'),
        silly: sinon.stub(logger, 'silly')
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

    afterEach(function() {
      sandbox.restore();
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  after(function() {
    mockery.disable();
  });
});
