var sys = require('sys'),
    path = require('path');

var libdir = path.join(__dirname, '../lib');
var testdir = path.join(__dirname, '../test/unit');

require.paths.push(libdir);
require.paths.push(testdir);

var testrunner = require('nodeunit').testrunner;

if(module.id === '.'){
    require.paths.push(process.cwd());
    var args = process.ARGV.slice(2);
    testrunner.run(args);
}
