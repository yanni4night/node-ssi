/**
 * Copyright (C) 2014 yanni4night.com
 * ssi_test.js
 *
 * changelog
 * 2014-08-20[11:05:59]:authorized
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

'use strict';

var grunt = require('grunt');
var ssi = require('../index');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.ssi = {
    setUp: function(done) {
        done();
    },
    ssi: function(test) {
        test.ok(!!ssi.compile('hello'));
        test.done();
    }
};