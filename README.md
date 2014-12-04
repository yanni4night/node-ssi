node-ssi
======

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Build status][appveyor-image]][appveyor-url] [![Built with Grunt][grunt-image]][grunt-url]

A server-side-include system for nodejs.

We only support parts of nginx ssi syntax:


      <!--# include file="path" -->
      <!--# include virtual="path" -->

      <!--# set var="k" value="v" -->

      <!--# echo var="n" default="default" -->

      <!--# if expr="test" -->
      <!--# elif expr="" -->
      <!--# else -->
      <!--# endif -->

Note:

* `file` includes are always relative to the baseDir provided in the options.
* `virtual` includes are relative to the current file.

usage
======

    var SSI = require('node-ssi');
    var ssi = new SSI({
            baseDir: './html/',
            encoding: 'utf-8'
            payload: {
                v: 5
            }
        });

    // handle a file
    ssi.compileFile('index.html', {payload:{title: 'Index'}}, function(err, content){

        });

    //handle a content
    ssi.compile('<!--# echo var="v" default="default" -->', function(err,content){

        });

test
======

`grunt test`

changelog
======
 - 2014-11-03[17:00:51]:support special chars like `\n`,`\v` etc.
 - 2014-12-04[12:39:20]:thanks for @nfriedly,we fixed some bugs and support more features

todo
======
better lexer

license
======

MIT

[downloads-image]: http://img.shields.io/npm/dm/node-ssi.svg
[npm-url]: https://npmjs.org/package/node-ssi
[npm-image]: http://img.shields.io/npm/v/node-ssi.svg

[travis-url]: https://travis-ci.org/yanni4night/node-ssi
[travis-image]: http://img.shields.io/travis/yanni4night/node-ssi.svg

[grunt-url]:http://gruntjs.com/
[grunt-image]: https://cdn.gruntjs.com/builtwith.png

[appveyor-image]:https://ci.appveyor.com/api/projects/status/6sv21grqrixe60yu?svg=true
[appveyor-url]:https://ci.appveyor.com/project/yanni4night/node-ssi

[david-dm-url]:https://david-dm.org/yanni4night/node-ssi
[david-dm-image]:https://david-dm.org/yanni4night/node-ssi.svg

