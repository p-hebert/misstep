import 'babel-polyfill';
import { expect } from 'chai';

describe('index', function(){
  it('should expose all major components of Misstep', function(done){
    let index = require('../../src/index.js');
    let misstep = new index();
    expect(index).to.be.a('function');
    expect(index.name).to.be.equal('MisstepWrapper');
    expect(misstep.constructor.name).to.be.equal('Misstep');
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
    expect(index.builtin_types).to.be.an('array');
    expect(index.builtin_types[0]).to.be.an('object');
    expect(index.builtin_types[0].key).to.be.equal('ECMASCRIPT');
    expect(index.builtin_types[0].callback).to.be.a('function');
    expect(index.builtin_enum).to.be.an('array');
    done();
  });
});
