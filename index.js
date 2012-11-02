var Script = process.binding('evals').NodeScript;
var modules = require('./modules');
var assert = require('assert');

var prefixBase = require('fs').readFileSync(__dirname + '/boxed.js', 'ascii');

function nothing() {}

// 
// code is a hash of codes generated by build.js
//
function SandBox (code, config) {
  var self = this;
  self.config = config;
  self.raw_server = null;//function () {throw "server not implemented";};
  self.count=100000;
  self.last_count_time = Date.now();
  self.error = false;
  this.context = {
    ___server: function (fun) { if(self.raw_server === null) self.raw_server=fun; },
    __get_code: function (name) {
      if(modules[name]) {
        if(typeof modules[name] == "string")
          return modules[name];
        return modules[name](self.context, config);
      }else{
        return code[name];
      }
    },
    __process_compile: process.compile,
    __process_exit: function () {
      self.context=null;
    },

    __loop_check_: function () {
      if(self.count-- > 0)
        return true;
      var time = Date.now() - self.last_count_time;
      if(time < 5*1000)
        return false;
      self.last_count_time = Date.now();
      if(time < 60*1000) {
        self.count = time/10;
        return true;
      }
      self.count = 1000000; // 1,000,000
      return true;
    },

    // other things
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval,

    debug: console.log,
    console: {
      log: self.config.log, 
      info: self.config.log, 
      warn: self.config.error, 
      error: self.config.error, 
      dir: nothing, time: nothing, 
      timeEnd: nothing, 
      trace: nothing, 
      assert: function (a) { if(!a) throw "assert"; } 
    }
  };
  try {
    Script.runInNewContext(prefixBase + "(function () { "+code._+" })();", this.context, "main");
    self.config.set_result({ status: "success" });
  } catch(e) {
    if(e instanceof assert.AssertionError){
      self.config.set_result({ status: "failure", exception: e});
    } else {
      self.config.set_result({ status: "exception", exception: e});
    }
    self.error = true;
  }
}

SandBox.prototype.server = function (req, res) {
  try {
    this.raw_server(req, res);
  }catch (e) {
    var send="Server error";
    if(typeof e == "string")
      send =e;
    else{
      send =e.message+"\n\n"+e.type+"\n\n"+e.stack;
    }
    console.log(send);
    res.writeHead(503, {"Content-Type": "text/plain"});
    res.end(send);
  }
};


exports.SandBox = SandBox;
exports.build = function () {
  return require('./build').build.apply(this, arguments)
};
