var path = require('path');
var extractor = require(path.join(__dirname, 'extractor')),
    fetcher = require(path.join(__dirname, 'fetcher'));

exports.extractFromUrl = function(urlStr, callback , options){
   fetcher.fetchUrl(urlStr, function(error, code, header, content){
      if(error){
         callback(error, null);
      }else{
         _extract(content, function(error, result){
            callback(error, result, {
               statusCode: code,
               headers: header
            });
         }, options);
      }
   });
};

exports.extractFromText = function(text, callback, options){
   _extract(content, callback, options);
};

function _extract(content, callback, options){
   try{
      var result = extractor.extract(content, options);
      callback(false, result);
   }catch(e){
      callback(e, null);
   }
};