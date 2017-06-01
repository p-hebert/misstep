import 'babel-polyfill';
import { expect } from 'chai';
import ExtendableError from '../../../src/components/errors/ExtendableError';

describe('ExtendableError', function() {
  describe('constructor', function() {
    it('should create an instance of Error', function(done) {
      expect(new ExtendableError()).to.be.instanceof(Error, 'ExtendableError is not an instance of Error');
      done();
    });

    it('should add message and payload to ExtendableError object', function(done) {
      const msg = 'message';
      const pay = 'payload';
      const err = new ExtendableError(msg, pay);
      expect(err.message).to.be.equal(msg, 'Messages do not match');
      expect(err.payload).to.be.equal(pay, 'Payload do not match');
      done();
    });

    it('should have default message as undefined and payload as null', function(done) {
      const err = new ExtendableError();
      expect(err.message).to.be.equal(undefined, 'Message should be undefined');
      expect(err.payload).to.be.equal(null, 'Payload should be null');
      done();
    });

    it('should have a ExtendableError stack trace', function(done) {
      const err = new ExtendableError();
      expect(err.stack).to.have.string('ExtendableError', 'ExtendableError stack is not of ExtendableError type');
      done();
    });

    it('should have a ExtendableError stack trace even if Error.captureStackTrace is not a function', function(done) {
      const captureStackTrace = Error.captureStackTrace;
      Error.captureStackTrace = undefined;
      const err = new ExtendableError();
      expect(err.stack).to.have.string('ExtendableError', 'ExtendableError stack is not of ExtendableError type');
      Error.captureStackTrace = captureStackTrace;
      done();
    });
  });
});
