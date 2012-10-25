var cheerio = require('cheerio');
var request = require('request');

request('http://www.samstokes.co.uk/', function (error, response, body) {
  if (!error && response.statusCode == 200) {

    $ = cheerio.load(body);

    console.log( $("title").text() );

  }
});


