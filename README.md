you can require using:
    sandbox = require('node-sandbox');

    sandbox.build(code.toString(), "<display_name.js>", function (d) {
      var boxes = new sandbox.SandBox(d, {
        log: function(s){ 
          // convert anything
        }
      });
    });

