if(process.argv.length < 3  || typeof process.argv[2] == "undefined") {
  console.log("Usage: node test-run.js sample.js\n");
  process.exit(1);
}


console.log("Sandboxing...");
console.log("=============");

var sandbox = require('./..');
var fs = require('fs');

fs.readFile('./' + process.argv[2], function(err, code) {
  var data = code.toString('ascii', 0);

  sandbox.build(data, "main.js", function (d) {
    var boxes = new sandbox.SandBox(d, { 
      log: function(c){
        console.log(c);
      }
    });
  });
});
