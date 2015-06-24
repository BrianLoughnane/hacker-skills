var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var async = require('async');
// var frontend = require('./frontend.js');
// var backend = require('./backend.js');
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
      link = links[i];
      tasks.push(
        function(callback) {
          request(link, function (error, response, html) {
            if(error) res.send(error);

            var $ = cheerio.load(html)
            var postBody = $('body *').text();
            callback(null, postBody);
          }); // end request(...)
        } // end function declaration
      ) // end tasks.push
    } // end for loop

    async.parallel(tasks, function (err, results) {
      if(err) console.log(err);

      results = results.join(' ').replace(/\s+/g, ' ').toLowerCase();

      var counts = {};
      var frontend = ['frontend', 'front end', 'front-end', 'web', 'javascript', 'es6', 'node', 'nodejs', 'node.js', 'angular', 'ionic', 'backbone', 'd3', '3js', 'ember', 'react', 'react native', 'flux', 'coffeescript'];
      var backend = ['backend', 'back end', 'back-end', 'rails', 'ruby', 'server', 'database', 'system'];
      var keywords = frontend.concat(backend);
      var keyword;

      for(var i = 0; i < keywords.length; i++) {
        keyword = keywords[i];  
        var pattern = new RegExp(keyword,"g");
        var matches = results.match(pattern);
        counts[keyword] = (matches) ? matches.length : 0 ;
      }

      var resString = JSON.stringify(counts);
      res.send(resString);
    });

    // function parseAndSend(results) {
    //   debugger
    //   // res.send('success');
    //   res.send(JSON.stringify(results));
    //   // res.send(resultsString);
    //   // res.send(JSON.stringify(resultsString));
    // }

    //write scraped data to a file
    // fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {
    //   if(err) throw err;
    //   console.log('file "output.json" successfully written');
    // });

  });
  // res.send('success!');
}); // end GET /

// Launch web server
// Visit a URL on our server that activates the web scraper
// The scraper will make a request to the website we want to scrape
// The request will capture the HTML of the website and pass it along to our server
// We will traverse the DOM and extract the information we want
// Next, we will format the extracted data into a format we need
// Finally, we will save this formatted data into a JSON file on our machine


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
