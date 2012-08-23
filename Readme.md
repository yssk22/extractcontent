[![build status](https://secure.travis-ci.org/yssk22/extractcontent.png)](http://travis-ci.org/yssk22/extractcontent)

# extractcontent

This module extracts title and main contents from an HTML text.

Algorithm is ported from the original implementation in Ruby

* http://rubyforge.org/projects/extractcontent/
* http://labs.cybozu.co.jp/blog/nakatani/2007/09/web_1.html

## Usage

    var ex = require('extractcontent')
    ex.extractFromUrl('http://yssk22.blogspot.com/', function(error, result){ 
       console.log(result.title); 
       // -> Relaxed in Japan.
       console.log(result.content); 
       // -> last week ... 
    });

## Install

    npm install extractcontent
