/*
 * ported from http://rubyforge.org/projects/extractcontent/
 */

var DEFAULT_OPTS = {
   threshold : 100,
   min_length : 80,
   decay_factor : 0.73,
   continuous_factor : 1.62,
   punctuation_weight : 10,
   punctuations : /([、。，．！？]|\.[^A-Za-z0-9]|,[^0-9]|!|\?)/i,
   waste_expressions : /Copyright|All Rights Reserved/i,
   debug : false
};

SKIP_ANALYSIS = /<\/frameset>|<meta\s+http-equiv\s*=\s*["']?refresh['"]?[^>]*url/i;
GOOGLE_ADSENSE_IGNORE = /<!--\s*google_ad_section_start\(weight=ignore\)\s*-->.*?<!--\s*google_ad_section_end.*?-->/mg;

exports.extract = function(html, options){
   if(html.match(SKIP_ANALYSIS)){
      return  {'title': extract_title(html), 'content':''};
   }

   options = options || {};
   for(k in DEFAULT_OPTS){
      if(options[k] == undefined){
         options[k] = DEFAULT_OPTS[k];
      }
   }
   var title = undefined;
   var content = undefined;
   if(html.match(/<\/head\s*>/im)){
      title = extract_title(RegExp.leftContext);
      if( title != ''){
         html = RegExp.rightContext;
      }else{
         title = extract_title(html);
      }
   }else{
      title = extract_title(html);
   }

   html = html.replace(GOOGLE_ADSENSE_IGNORE, '');
   if(html.match(/<!--\s*google_ad_section_start[^>]*-->/)){
      //html.match(/<!--\s*google_ad_section_start[^>]*-->[\s\S]*<!--\s*google_ad_section_end.*?-->/img);
      html = scan(html, /<!--\s*google_ad_section_start[^>]*-->[\s\S]*<!--\s*google_ad_section_end.*?-->/img).join("\n");
   }
   html = eliminate_useless_tags(html);

   html = html.replace(/(<h\d\s*>\s*(.*?)\s*<\/h\d\s*>)/ig, function(m){
      if( RegExp.$2.length >= 3 && title.indexOf(RegExp.$2) >= 0){
         return "<div>" + RegExp.$2 + "</div>";
      }else{
         return RegExp.$2;
      }
   });

   var factor = 1.0, continuous = 1.0,
       body = '', score = 0, bodylist = [];
   var list = html.split(/<\/?(?:div|center|td)[^>]*>|<p\s*[^>]*class\s*=\s*["']?(?:posted|plugin-\w+)['"]?[^>]*>/);
   for(var i in list){
      var block = list[i];
      if( !block ){ continue; }

      block = strip(block);
      if( has_only_tags(block) ){ continue; }

      if( body.length > 0 ){
         continuous = continuous / options['continuous_factor'];
      }
      var notlinked = eliminate_link(block);
      if( notlinked.length < options['min_length']){
         continue;
      }

      var c = (notlinked.length + scan(notlinked, options.punctuations).length * options.punctuation_weight) * factor;
      factor = factor * options.decay_factor;
      var not_body_rate =
         scan(block, options.waste_expressions).length +
         scan(block, /amazon[a-z0-9\.\/\-\?&]+-22/ig).length / 2.0;

      if(not_body_rate > 0){
         c = c + Math.pow(0.72, not_body_rate);
      }
      var c1 = c * continuous;
      if( c1 > options['threshold']){
         body = body + block + '\n';
         score = score + c1;
         continuous = options.continuous_factor;
      }else if(c > options['threshold']){
         bodylist.push([body, score]);
         body = body + block + '\n';
         score = c;
         continuous = options.continuous_factor;
      }
      bodylist.push(body, score);
   }
   var s = 0;

   bodylist.forEach(function(a){
      if(s < a[1]){
         content = a[0];
         s = a[1];
      }
   });

   return {
      'title' : title,
      'content' : strip(strip_tags(content))
   };
};

function extract_title(st){
   if( st.match(/<title[^>]*>\s*(.*?)\s<\/title\s*>/im) ){
      return RegExp.$1;
   }else{
      if( st.match(/<h\d[^>]*>\s*(.*?)\s*<\/h\d\s*>/im)){
         return strip_tags(RegExp.$1);
      }else {
         return '';
      }
   }
}

function eliminate_useless_tags(html){
   html.replace(/<(script|style|select|noscript)[^>]*>.*?<\/\1\s*>/img, '');
   html.replace(/<!--.*?-->/mg, '');
   html.replace(/<![A-Za-z].*?>/g, '');
   html.replace(/<div\s[^>]*class\s*=\s*['"]?alpslab-slide["']?[^>]*>.*?<\/div\s*>/igm, '');
   html.replace(/<div\s[^>]*(id|class)\s*=\s*['"]?\S*more\S*["']?[^>]*>/ig, '');
   return html;
}

function eliminate_link(html){
   var count = 0;
   var notlinked = html.replace(/<a\s[^>]*>.*?<\/a\s*>/img, function(a){
      count = count +1;
      return '';
   });
   notlinked = notlinked.replace(/<form\s[^>]*>.*?<\/form\s*>/img, '');
   notlinked = strip_tags(notlinked);
   if(notlinked.length < 20 * count || islinklist(html)){
      return '';
   }else{
      return notlinked;
   }
}

function islinklist(st){
   if(st.match(/<(?:ul|dl|ol)(.+?)<\/(?:ul|dl|ol)/img)){
      var listpart = RegExp.$1;
      var outside = st.replace(/<(?:ul|dl)(.+?)<\/(?:ul|dl)>/img, '').replace(/<.+?>/img, '').replace(/\s+/, ' ');
      var list = listpart.split(/<li[^>]*>/);
      list.shift();
      var r = evaluate_list(list);
      return outside.length <= st.length / (45/rate);
   }
   return null;
}

function evaluate_list(list){
   if(list.length == 0){
      return true;
   }
   var hit = 0;
   list.forEach(function(line){
      if(line.match(/<a\s+href=(['"]?)([^"'\s]+)\1/img)){
         hit = hit + 1;
      }
   });
   var a = (1.0 * hit / list.length);
   return 9 * (a * a) + 1;
}

function has_only_tags(st){
   st = strip(st.replace(/<[^>]*>/img, '').replace(/\&nbsp\;/img, ''));
   return st.length == 0;
}

function strip(st){
   return st.replace(/^\s*([\s\S]*?)\s*$/g, "$1");
}

function scan(st, regex){
   return st.match(regex) || [];
}

function strip_tags(html){
   if( html ){
      var st = html.toString();
      return st.replace(/<\/?[^>]+>/img, '');
   }else{
      return '';
   }
}