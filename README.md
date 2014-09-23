node-ssi
======
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
    ssi.compileFile('index.html', {title: 'Index'}, function(err, content){

        });

    //handle a content
    ssi.compile('<!--# echo var="v" default="default" -->', {}, function(err,content){

        });

test
======

`grunt test`

license
======

MIT




