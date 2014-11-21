node-ssi
======

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Support us][gittip-image]][gittip-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Build status][appveyor-image]][appveyor-url] [![Built with Grunt][grunt-image]][grunt-url]

A server-side-include system for nodejs.

We only support parts of nginx ssi syntax:

    
      <!--# include file="path" -->
     
      <!--# set var="k" value="v" -->
     
      <!--# echo var="n" default="default" -->
     
      <!--# if expr="test" -->
      <!--# elif expr="" -->
      <!--# else -->
      <!--# endif -->

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

todo
======
use lexer syntax

license
======

MIT


[gittip-url]: https://www.gittip.com/yanni4night/
[gittip-image]: http://img.shields.io/gittip/yanni4night.svg

[downloads-image]: http://img.shields.io/npm/dm/node-ssi.svg
[npm-url]: https://npmjs.org/package/node-ssi
[npm-image]: http://img.shields.io/npm/v/node-ssi.svg

[travis-url]: https://travis-ci.org/yanni4night/node-ssi
[travis-image]: http://img.shields.io/travis/yanni4night/node-ssi.svg

[coveralls-url]: https://coveralls.io/r/yanni4night/node-ssi
[coveralls-image]: http://img.shields.io/coveralls/yanni4night/node-ssi/master.svg

[grunt-url]:http://gruntjs.com/
[grunt-image]: http://img.shields.io/badge/BUILT%20WITH-GRUNT-yellow.svg

[appveyor-image]:https://ci.appveyor.com/api/projects/status/6sv21grqrixe60yu?svg=true
[appveyor-url]:https://ci.appveyor.com/project/yanni4night/node-ssi

