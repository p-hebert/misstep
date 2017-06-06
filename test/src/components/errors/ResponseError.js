import 'babel-polyfill';
import { expect } from 'chai';
import ResponseError from '../../../../src/components/errors/ResponseError';

describe('ResponseError', function() {
  describe('constructor', function() {
    it('should create an instance of Error', function(done) {
      expect(new ResponseError()).to.be.instanceof(Error, 'ResponseError is not an instance of Error');
      done();
    });

    it('should add message, payload, type, and status to ResponseError object', function(done) {
      const message = 'message';
      const payload = 'payload';
      const type = 'RESPONSE:DEFAULT:TEST';
      const status = 500;
      const err = new ResponseError({message, payload, type, status});
      expect(err.message).to.be.equal(message, 'Messages do not match');
      expect(err.payload).to.be.equal(payload, 'Payload do not match');
      expect(err.type).to.be.equal(type, 'Types do not match');
      expect(err.status).to.be.equal(status, 'Statuses do not match');
      done();
    });

    it('should have a ResponseError stack trace', function(done) {
      const err = new ResponseError();
      expect(err.stack).to.have.string('ResponseError', 'ResponseError stack is not of ResponseError type');
      done();
    });

    it('should have the proper error type', function(done) {
      const type = 'RESPONSE:DEFAULT:ERROR';
      const err = new ResponseError();
      expect(err.type).to.be.equal(type, 'ResponseError type is invalid');
      done();
    });
  });
});
