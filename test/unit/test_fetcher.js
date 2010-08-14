var fetcher = require('fetcher');
exports.test2XX = function(test){
   fetcher.fetchUrl('http://www.yssk22.info/', function(error, code, header, content){
      test.equals(error, false);
      test.equals(code, 200);
      test.ok(header != null);
      test.ok(content != null);
      test.done();
   });
};
exports.test3XX = function(test){
   fetcher.fetchUrl('http://www.yssk22.info/top', function(error, code, header, content,
                                                           redirected){
      test.equals(error, false);
      test.equals(code, 200);
      test.ok(header != null);
      test.ok(content != null);
      test.equals(redirected, "http://www.yssk22.info/relax/_design/mytweets/_list/timeline/by_date?descending=true");
      test.done();
   });
};
exports.test4XX = function(test){
   fetcher.fetchUrl('http://www.yssk22.info/a', function(error, code, header, content){
      test.equals(error, true, 'assertion failed:' + code);
      test.equals(code, 404);
      test.done();
   });
};
exports.testInvalidUrl = function(test){
   fetcher.fetchUrl('foobar', function(error, code){
      // TODO
      // test.equals(error, new fetcher.errors.InvalidUrlError());
      test.done();
   });
};

exports.testTooManyRedirection = function(test){
   // TODO
   test.done();
};