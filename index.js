var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var url;

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
