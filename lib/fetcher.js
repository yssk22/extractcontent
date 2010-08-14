var http = require('http'),
    url = require('url');

MAX_REDIRECTION = 5;

// TODO how the best practice to define exceptions?
var errors = {
   InvalidUrlError : function(){},
   TooManyRedirectionError : function(){}
};

exports.errors = errors;
exports.fetchUrl = function(urlStr, callback){
   _fetchUrl(urlStr, 0, callback);
};

function _fetchUrl(_urlStr, redirection, _callback){
   if( redirection == MAX_REDIRECTION ){
      _callback(new TooManyRedirectionError());
   }

   var target = url.parse(_urlStr);
   if( target.host === undefined ){
      _callback(new exports.errors.InvalidUrlError());
   }
   var client = http.createClient(target.port || 80, target.hostname,
                                  target.protocol == 'https:');
   var request = client.request('GET', target.pathname,
                                {'host': target.hostname });
   request.end();
   request.on("response", function(response){
      if(300 <= response.statusCode && response.statusCode < 400 ){
         var location = response.headers.location;
         _fetchUrl(location, redirection + 1, _callback);
      }else {
         var code   = response.statusCode;
         var headers = response.headers;
         var content = '';
         response.on('data', function(chunk){
            content += chunk;
         });
         response.on('end', function(){
            _callback(code >= 400,
                      code, headers, content,
                      redirection > 0 ? _urlStr : null);
         });
      }
   });
};
