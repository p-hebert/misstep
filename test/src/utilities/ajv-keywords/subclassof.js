'use strict';

var Ajv = require('ajv');
var defFunc = require('../../../../src/utilities/ajv-keywords/subclassof');
var defineKeywords = require('ajv-keywords');
var should = require('chai').should();


describe('keyword "subclassof"', function() {
  var ajvs = [
    defFunc(new Ajv),
    // defineKeywords(new Ajv, 'subclassof'),
    // defineKeywords(new Ajv)
  ];

  class ChildObject {}
  class GrandChildObject extends ChildObject {}
  class ChildArray extends Array {}
  class GrandChildArray extends ChildArray {}
  class ChildFunction extends Function {}
  class GrandChildFunction extends ChildFunction {}
  class ChildNumber extends Number {}
  class GrandChildNumber extends ChildNumber {}
  class ChildString extends String {}
  class GrandChildString extends ChildString {}
  class ChildDate extends Date {}
  class GrandChildDate extends ChildDate {}
  class ChildRegExp extends RegExp {}
  class GrandChildRegExp extends ChildRegExp {}
  class ChildBuffer extends Buffer {}
  class GrandChildBuffer extends ChildBuffer {}

  class ParentClass {}
  class ChildClass extends ParentClass {}

  class SomeClass {}

  ajvs.forEach(function (ajv, i) {
    it('should validate classes #' + i, function() {
      ajv.validate({ subclassof: 'Object' }, ChildObject).should.equal(true);
      ajv.validate({ subclassof: 'Object' }, GrandChildObject).should.equal(true);
      ajv.validate({ subclassof: 'Object' }, {}).should.equal(false);
      ajv.validate({ subclassof: 'Array' }, ChildArray).should.equal(true);
      ajv.validate({ subclassof: 'Array' }, GrandChildArray).should.equal(true);
      ajv.validate({ subclassof: 'Array' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'Array' }, []).should.equal(false);
      ajv.validate({ subclassof: 'Function' }, ChildFunction).should.equal(true);
      ajv.validate({ subclassof: 'Function' }, GrandChildFunction).should.equal(true);
      ajv.validate({ subclassof: 'Function' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'Function' }, function(){}).should.equal(false);
      ajv.validate({ subclassof: 'Number' }, ChildNumber).should.equal(true);
      ajv.validate({ subclassof: 'Number' }, GrandChildNumber).should.equal(true);
      ajv.validate({ subclassof: 'Number' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'Number' }, new Number(42)).should.equal(false);
      ajv.validate({ subclassof: 'Number' }, 42).should.equal(false);
      ajv.validate({ subclassof: 'String' }, ChildString).should.equal(true);
      ajv.validate({ subclassof: 'String' }, GrandChildString).should.equal(true);
      ajv.validate({ subclassof: 'String' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'String' }, new String('foo')).should.equal(false);
      ajv.validate({ subclassof: 'String' }, 'foo').should.equal(false);
      ajv.validate({ subclassof: 'Date' }, ChildDate).should.equal(true);
      ajv.validate({ subclassof: 'Date' }, GrandChildDate).should.equal(true);
      ajv.validate({ subclassof: 'Date' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'Date' }, new Date()).should.equal(false);
      ajv.validate({ subclassof: 'Date' }, {}).should.equal(false);
      ajv.validate({ subclassof: 'RegExp' }, ChildRegExp).should.equal(true);
      ajv.validate({ subclassof: 'RegExp' }, GrandChildRegExp).should.equal(true);
      ajv.validate({ subclassof: 'RegExp' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'RegExp' }, /.*/).should.equal(false);
      ajv.validate({ subclassof: 'Buffer' }, ChildBuffer).should.equal(true);
      ajv.validate({ subclassof: 'Buffer' }, GrandChildBuffer).should.equal(true);
      ajv.validate({ subclassof: 'Buffer' }, ChildObject).should.equal(false);
      ajv.validate({ subclassof: 'Buffer' }, Buffer.from('foo')).should.equal(false);
    });

    it('should validate multiple classes #' + i, function() {
      ajv.validate({ subclassof: ['Array', 'Function'] }, ChildFunction).should.equal(true);
      ajv.validate({ subclassof: ['Array', 'Function'] }, GrandChildFunction).should.equal(true);
      ajv.validate({ subclassof: ['Array', 'Function'] }, ChildArray).should.equal(true);
      ajv.validate({ subclassof: ['Array', 'Function'] }, GrandChildArray).should.equal(true);
      ajv.validate({ subclassof: ['Array', 'Function'] }, Array).should.equal(false);
      ajv.validate({ subclassof: ['Array', 'Function'] }, Function).should.equal(false);
      ajv.validate({ subclassof: ['Array', 'Function'] }, ChildObject).should.equal(false);
    });

    it('should allow adding classes #' + i, function() {
      should.throw(function() {
        ajv.compile({ subclassof: 'ParentClass' });
      });

      defFunc.definition.CONSTRUCTORS.ParentClass = ParentClass;

      ajv.validate({ subclassof: 'ParentClass' }, ChildClass).should.equal(true);
      ajv.validate({ subclassof: 'Object' }, ChildClass).should.equal(true);
      ajv.validate({ subclassof: 'ParentClass' }, SomeClass).should.equal(false);
      ajv.validate({ subclassof: 'ParentClass' }, ParentClass).should.equal(false);

      delete defFunc.definition.CONSTRUCTORS.ParentClass;
      ajv.removeSchema();

      // should.throw(function() {
      //   ajv.compile({ subclassof: 'ParentClass' });
      // });
      //
      // defineKeywords.get('subclassof').definition.CONSTRUCTORS.ParentClass = ParentClass;
      //
      // ajv.validate({ subclassof: 'ParentClass' }, ChildClass).should.equal(true);
      // ajv.validate({ subclassof: 'Object' }, ChildClass).should.equal(true);
      // ajv.validate({ subclassof: 'ParentClass' }, SomeClass).should.equal(false);
      // ajv.validate({ subclassof: 'ParentClass' }, ParentClass).should.equal(false);
      //
      // delete defFunc.definition.CONSTRUCTORS.ParentClass;
      // ajv.removeSchema();
    });

    it('should throw when not string or array is passed #' + i, function() {
      should.throw(function() {
        ajv.compile({ subclassof: 1 });
      });
    });
  });
});
