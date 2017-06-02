import 'babel-polyfill';
import { expect } from 'chai';
import MisstepError from '../../../src/components/errors/MisstepError';

describe('MisstepError', function() {
  describe('constructor', function() {
    it('should create an instance of Error', function(done) {
      expect(new MisstepError()).to.be.instanceof(Error, 'MisstepError is not an instance of Error');
      done();
    });

    it('should add message and payload to MisstepError object', function(done) {
      const msg = 'message';
      const pay = 'payload';
      const err = new MisstepError(msg, pay);
      expect(err.message).to.be.equal(msg, 'Messages do not match');
      expect(err.payload).to.be.equal(pay, 'Payload do not match');
      done();
    });

    it('should have a MisstepError stack trace', function(done) {
      const err = new MisstepError();
      expect(err.stack).to.have.string('MisstepError', 'MisstepError stack is not of MisstepError type');
      done();
    });

    it('should have the proper error type', function(done) {
      const type = 'MISSTEP:DEFAULT:ERROR';
      const err = new MisstepError();
      expect(err.type).to.be.equal(type, 'MisstepError type is invalid');
      done();
    });
  });
});
