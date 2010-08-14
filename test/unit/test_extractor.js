var extractor = require('extractor'),
    fs = require('fs'),
    path = require('path');
exports.testExtract = function(test){
   var sampledir = path.join(__dirname, '../fixtures/samples');
   var content = fs.readFileSync(
      path.join(sampledir, 'yssk22.blogspot.com'), 'utf8');
   var result = extractor.extract(content);
   var lines = result.content.split("\n");
   test.equals(result.title, 'Relaxed in Japan.');
   test.equals(lines[0], "last week  I started my small prototype project, GaeCouch.  I'll describe why I started on this post.");
   test.done();
};