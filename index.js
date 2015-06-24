var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var async = require('async');
var frontend = require('./frontend.js');
var backend = require('./backend.js');
var other = require('./other.js');
var counter = require('./count.js');
var url;

app.use(express.static('client'));

app.get('/hackernews', function (req, res) {

  // the url we will scrape from
  url = 'https://news.ycombinator.com/jobs'

  // the structure of our request call
  request(url, function (error, response, html) {
    if(error) throw error;

    // use cheerio library on html for jQuery-like functionality
    var $ = cheerio.load(html);

    // set some variables
    var postTitles = [];
    var postBodies = [];
    var links = [];
    var link;
    var tasks = [];

    // traverse DOM to scrape data
    var anchors = $('.athing').find('a'); //etc
    anchors.each(function(index) {
      var a = $(this);
      postTitles.push(a.text());
      links.push(a.attr('href'));
    });

    links = links.map(function (link) {
      if(link.slice(0,4) === 'item') {
        return 'https://news.ycombinator.com/' + link;
      } else {
        return link;
      }
    });


    for(var i = 0; i < links.length; i++) {
      (function () {
        var link = links[i].slice();
        tasks.push(
          function(callback) {
            request(link, function (error, response, html) {
              console.log(link);
              if(error) res.send(error);

              var $ = cheerio.load(html)
              var postBody = $('body *').text();
              callback(null, postBody);
            }); // end request(...)
          } // end function declaration
        ) // end tasks.push
      })()
    } // end for loop

    async.parallel(tasks, function (err, results) {
      if(err) console.log(err);

      results = results.join(' ').replace(/\s+/g, ' ').toLowerCase();

      var counts = {};
      var keywords = frontend.concat(backend).concat(other);
      var keyword;

      for(var i = 0; i < keywords.length; i++) {
        keyword = keywords[i];  
        var pattern = new RegExp(keyword,"g");
        var matches = results.match(pattern);
        counts[keyword] = (matches) ? matches.length : 0 ;
      }
      counts['totalFront'] =  counter(counts, frontend);
      counts['totalBack'] = counter(counts, backend);
      counts['totalOther'] = counter(counts, other);

      var resString = JSON.stringify(counts);
      res.send(resString);
    });

    //write scraped data to a file
    // fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {
    //   if(err) throw err;
    //   console.log('file "output.json" successfully written');
    // });

  });
  // res.send('success!');
}); // end GET /


app.get('/scrape', function (req, res) {

  // the url we will scrape from
  url = ''

  // the structure of our request call
  request(url, function (error, response, html) {
    if(error) throw error;

    // use cheerio library on html for jQuery-like functionality
    var $ = cheerio.load(html);

    // define a json object
    var json = {};

    // traverse DOM to scaper data
    var data = $('body'); //etc

    // set json data
    json.data = data; //etc

    //write scraped data to a file
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {
      if(err) throw err;
      console.log('file "output.json" successfully written');
    });

  });
  res.send('success!');
}); // end GET /scrape

app.listen('8081');

console.log('Server listening on port 8081');

module.exports = app;
