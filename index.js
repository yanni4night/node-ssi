/**
 * Copyright (C) 2014 yanni4night.com
 * index.js
 *
 * changelog
 * 2014-08-20[11:00:06]:authorized
 * 2014-08-25[14:43:48]:fixed empty output when no tag is resolved
 * 2014-09-23[14:07:07]:fixed line break lost
 * 2014-09-23[14:55:07]:support options absence
 * 2014-11-05[11:49:30]:optimize line-handling
 * 2014-11-22[20:38:07]:remove \r
 *
 * @author yanni4night@gmail.com
 * @version 0.1.5
 * @since 0.1.0
 */


"use strict";

var extend = require('extend');
var fs = require('fs');
var path = require('path');
var async = require('async');


var syntaxReg = /<!--#([^\r\n]+?)-->/mg;
var includeFileReg = /<!--#\s*include\s+file=(['"])([^\r\n]+?)\1\s*-->/;
var setVarReg = /<!--#\s*set\s+var=(['"])([^\r\n]+?)\1\s+value=(['"])([^\r\n]+?)\3\s*-->/;
var echoReg = /<!--#\s*echo\s+var=(['"])([^\r\n]+?)\1(\s+default=(['"])([^\r\n]+?)\4)?\s*-->/;
var ifReg = /<!--#\s*if\s+expr=(['"])([^\r\n]+?)\1\s*-->/;
var elifReg = /<!--#\s*elif\s+expr=(['"])([^\r\n]+?)\1\s*-->/;
var elseReg = /<!--#\s*else\s*-->/;
var endifReg = /<!--#\s*endif\s*-->/;


/**
 * Resolve source
 *
 * @param  {String} tpl Source
 * @return {Function}
 * @since 0.1.0
 * @version 0.1.2
 */
function resolve(tpl) {
    //resolve set/echo/if
    var fnStr = 'var _r="";\nwith(__data){\n';
    var matches, key, val, pat, eq;

    var start = 0,
        lastMatches;

    var resolveLine = function(str) {
        //This is stupid but works for "\r\b\f\u\v\n".
        //Here we assume line break is "\n"
        return str.replace(/\r/mg, '').replace(/\\/mg, '\\\\').replace(/"/mg, '\\"').replace(/\n/mg, '\\n\\\n');
    };

    while (!!(matches = syntaxReg.exec(tpl))) {
        fnStr += '_r += "' + resolveLine(tpl.slice(start, matches.index)) + '";\n';
        start = matches[0].length + matches.index;
        lastMatches = matches;

        switch (true) {
            case setVarReg.test(matches[0]):
                key = RegExp.$2;
                val = RegExp.$4;
                fnStr += 'var ' + key + ' = "' + val + '";\n';
                break;
            case echoReg.test(matches[0]):
                key = RegExp.$2;
                val = RegExp.$5 || "";
                fnStr += '_r += ' + key + '||"' + val + '";\n';
                break;
            case ifReg.test(matches[0]):
                pat = String.prototype.trim.call(RegExp.$2 || "");
                if (/([\w\$\.-]+)\s*(!)?=\s*([\w\.-]+)/.test(pat)) {
                    val = RegExp.$3;
                    eq = RegExp.$2;
                    key = RegExp.$1.replace(/^\$/, '');
                    fnStr += 'if(' + key + (eq ? '!=' : '==') + '"' + val + '"){\n';
                } else {
                    fnStr += 'if(' + pat.replace(/^\$/, '') + '){\n';
                }
                break;
            case elifReg.test(matches[0]):
                pat = String.prototype.trim.call(RegExp.$2 || "");
                if (/([\w\$\.-]+)\s*(!)?=\s*([\w\.-]+)/.test(pat)) {
                    val = RegExp.$3;
                    eq = RegExp.$2;
                    key = RegExp.$1.replace(/^\$/, '');
                    fnStr += '}else if(' + key + (eq ? '!=' : '==') + '"' + val + '"){\n';
                } else {
                    fnStr += '}else if(' + pat.replace(/^\$/, '') + '){\n';
                }
                break;
            case elseReg.test(matches[0]):
                fnStr += '}else{\n';
                break;
            case endifReg.test(matches[0]):
                fnStr += '}\n';
                break;
        }
    }

    if (lastMatches) {
        fnStr += '_r+="' + resolveLine(tpl.slice(lastMatches.index + lastMatches[0].length)) + '";';
    } else {
        fnStr += '_r+="' + resolveLine(tpl) + '";';
    }

    fnStr += '};\nreturn _r;';

    return new Function('__data', fnStr);
}

/**
 * SSI is a tool to resolve ssi syntax.
 *
 * @param {Object} initOptions
 * @class
 * @since 0.1.0
 * @version 0.1.0
 */
var SSI = function(initOptions) {
    this.options = extend({
        baseDir: '.',
        encoding: 'utf-8',
        payload: {}
    }, initOptions || {});
};

SSI.prototype = {
    regExps: {
        includeFileReg: includeFileReg,
        setVarReg: setVarReg,
        echoReg: echoReg,
        ifReg: ifReg,
        elifReg: elifReg,
        elseReg: elseReg,
        endifReg: endifReg
    },
    /**
     *
     * @param {Object} config
     */
    setDefaultOptions: function(options) {
        return extend(this.options, options || {});
    },
    /**
     *
     * <!--# include file="path" -->
     *
     * <!--# set var="k" value="v" -->
     *
     * <!--# echo var="n" default="default" -->
     *
     * <!--# if expr="test" -->
     * <!--# elif expr="" -->
     * <!--# else -->
     * <!--# endif -->
     *
     * @param  {String}   content
     * @param  {Object}   options
     * @param  {Function} callback
     */
    compile: function(content, options, callback) {
        var matches, seg, tpath, innerContent, func;

        if (arguments.length < 3) {
            callback = options;
            options = {};
        }

        options = extend({}, this.options, options || {});

        //resolve inlcudes
        async.whilst( // https://www.npmjs.org/package/async#whilst-test-fn-callback-
            function test() { return !!(matches = includeFileReg.exec(content)); },
            function insertInclude(next) {
                seg = matches[0];

                tpath = RegExp.$2;
                fs.readFile(path.join(options.baseDir, tpath), {
                        encoding: options.encoding
                    }, function(err, innerContent) {
                        if (err) {
                            return next(err);
                        }
                        content = content.slice(0, matches.index) + innerContent + content.slice(matches.index + seg.length);
                        next();
                    }
                );
            },
            function includesComplete(err) {
                if (err) {
                    return callback(err);
                }

                func = resolve(content);
                return callback(null, func(options.payload || {}));
            }
        );


    },
    /**
     *
     * @param  {String}   filepath
     * @param  {Object}   options
     * @param  {Function} callback
     */
    compileFile: function(filepath, options, callback) {

        if (arguments.length < 3) {
            callback = options;
            options = {};
        }

        options = extend({}, this.options, options || {});

        return fs.readFile(filepath, {
            encoding: options.encoding
        }, function(err, content) {
            if (err) {
                return callback(err);
            } else return SSI.compile(content, options, callback);
        });
    }
};

module.exports = SSI;
