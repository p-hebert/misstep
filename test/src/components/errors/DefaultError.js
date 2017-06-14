import 'babel-polyfill';
import { expect } from 'chai';
import DefaultError from '../../../../src/components/errors/DefaultError';

describe('DefaultError', function() {
  describe('constructor', function() {
    it('should create an instance of Error', function(done) {
      expect(new DefaultError()).to.be.instanceof(Error, 'DefaultError is not an instance of Error');
      done();
    });

    it('should add message, payload, type, and status to DefaultError object', function(done) {
      const message = 'message';
      const payload = 'payload';
      const type = 'DEFAULT:FALLBACK:ERROR';
      const err = new DefaultError({message, payload, type});
      expect(err.message).to.be.equal(message, 'Messages do not match');
      expect(err.payload).to.be.equal(payload, 'Payload do not match');
      expect(err.type).to.be.equal(type, 'Types do not match');
      done();
    });

    it('should have a DefaultError stack trace', function(done) {
      const err = new DefaultError();
      expect(err.stack).to.have.string('DefaultError', 'DefaultError stack is not of DefaultError type');
      done();
    });

    it('should have the proper error type', function(done) {
      const type = 'DEFAULT:FALLBACK:ERROR';
      const err = new DefaultError();
      expect(err.type).to.be.equal(type, 'DefaultError type is invalid');
      done();
    });
  });
});
