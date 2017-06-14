import 'babel-polyfill';
import { expect } from 'chai';

describe('index', function(){
  it('should expose all major components of Misstep', function(done){
    let index = require('../../src/index.js');
    expect(index.default).to.be.a('function');
    expect(index.default.name).to.be.equal('Misstep');
    expect(index.Builder).to.be.a('function');
    expect(index.Builder.name).to.be.equal('Builder');
    expect(index.Catcher).to.be.a('function');
    expect(index.Catcher.name).to.be.equal('Catcher');
    expect(index.Logger).to.be.a('function');
    expect(index.Logger.name).to.be.equal('Logger');
    expect(index.logger)
      .to.be.an('object')
      .that.has.all.keys(
        ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
      );
    expect(index.ExtendableError).to.be.a('function');
    expect(index.ExtendableError.name).to.be.equal('ExtendableError');
    expect(index.DefaultError).to.be.a('function');
    expect(index.DefaultError.name).to.be.equal('DefaultError');
    expect(index.ResponseError).to.be.a('function');
    expect(index.ResponseError.name).to.be.equal('ResponseError');
    done();
  });
});
