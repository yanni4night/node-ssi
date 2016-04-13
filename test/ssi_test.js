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
'use strict';

var grunt = require('grunt');
var SSI = require('../index');
var path = require('path');

exports.ssi = {
    setUp: function(done) {
        done();
    },
    ssi: function(test) {

        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compile(grunt.file.read(path.join(__dirname, './mock/index.html')), {
            payload: {
                title: 'Kitty',
                mqtt: 10
            }
        }, function(err, output) {
            test.ok(!err);
            test.ok(!!~output.indexOf('Kitty')); //from payload
            test.ok(!!~output.indexOf('<nav>')); //from header.html
            test.ok(!!~output.indexOf('Download')); //from menu.html
            test.ok(!!~output.indexOf('MQTT')); //from payload not equal
            //check a series of special chars
            test.ok(!!~output.indexOf('\\v'));
            test.ok(!!~output.indexOf('\\r'));
            test.ok(!!~output.indexOf('\\f'));
            test.ok(!!~output.indexOf('\\t'));
            test.ok(!!~output.indexOf('\\b'));
            test.ok(!!~output.indexOf('\\n'));
            test.ok(!!~output.indexOf('\\u'));
            test.ok(!!~output.indexOf('&#8226;'));
            test.ok(!!~output.indexOf('&amp;'));
            //check left syntax
            for (var reg in SSI.prototype.regExps) {
                test.ok(!SSI.prototype.regExps[reg].test(output));
            }
            test.done();
        });

    },
    compileFile: function(test) {
        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compileFile(path.join(__dirname, './mock/index.html'), {
            payload: {
                title: 'Kitty',
                mqtt: 10
            }
        }, function(err, output) {
            test.ok(!err);
            test.ok(!!~output.indexOf('Kitty')); //from payload
            test.ok(!!~output.indexOf('<nav>')); //from header.html
            test.ok(!!~output.indexOf('Download')); //from menu.html
            test.ok(!!~output.indexOf('MQTT')); //from payload not equal
            //check a series of special chars
            test.ok(!!~output.indexOf('\\v'));
            test.ok(!!~output.indexOf('\\r'));
            test.ok(!!~output.indexOf('\\f'));
            test.ok(!!~output.indexOf('\\t'));
            test.ok(!!~output.indexOf('\\b'));
            test.ok(!!~output.indexOf('\\n'));
            test.ok(!!~output.indexOf('\\u'));
            test.ok(!!~output.indexOf('&#8226;'));
            test.ok(!!~output.indexOf('&amp;'));
            //check left syntax
            for (var reg in SSI.prototype.regExps) {
                test.ok(!SSI.prototype.regExps[reg].test(output));
            }
            test.done();
        });
    },
    empty: function(test) {
        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compile(grunt.file.read(path.join(__dirname, './mock/empty.html')), function(err, output) {
            grunt.log.debug(output);

            test.ok(!!output);
            test.done();
        });
    },
    empty_var: function(test) {
        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compile(grunt.file.read(path.join(__dirname, './mock/empty-var.html')), function(err, output) {
            grunt.log.debug(output);

            test.ok(!!output);
            test.done();
        });
    },
    file_include: function(test) {
        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compileFile(path.join(__dirname, './mock/subdir/file-include.html'), function(err, output) {
            test.ok(!err);
            test.ok(!!~output.indexOf('<nav>')); //from header.html
            test.done();
        });
    },
    virtual_include: function(test) {
        var ssi = new SSI({
            baseDir: path.join(__dirname, './mock')
        });

        ssi.compileFile(path.join(__dirname, './mock/subdir/virtual-include.html'), function(err, output) {
            test.ok(!err);
            test.ok(output, 'output sent');
            test.ok(!!~output.indexOf('<nav>')); //from header.html
            test.done();
        });
    },
    virtual_include_with_directory: function(test) {
      var ssi = new SSI({
          baseDir: path.join(__dirname, './mock')
      });

      ssi.compileFile(path.join(__dirname, './mock/subdir/virtual-include-with-directory.html'), function(err, output) {
          test.ok(!err);
          test.ok(output, '<div>NESTED</div>');
          test.done();
      });
    },
    virtual_include_with_extra_attr: function(test) {
      var ssi = new SSI({
          baseDir: path.join(__dirname, './mock')
      });

      ssi.compileFile(path.join(__dirname, './mock/subdir/virtual-include-with-extra-attr.html'), function(err, output) {
          test.ok(!err);
          test.ok(output, '<div>NESTED</div>');
          test.done();
      });
    }
};
