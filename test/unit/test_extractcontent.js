var ex = require('extractcontent');
exports.test2XX = function(test){
   ex.extractFromUrl(
      'http://yssk22.blogspot.com/',
      function(error, result){
         test.equals(error, false);
         test.equals(result.title, 'Relaxed in Japan.');
         test.done();
      });
};
