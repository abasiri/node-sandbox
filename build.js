var db = {}
var jsmin = require('../lib/jsmin').jsmin;
var modules = require('./modules');
var spawn = require('child_process').spawn

function builder (code, Fname, callback) {
  this.callback = callback;
  this.need = {};
  this.pub = {};
  this.code = {}; // holds a list of all the required files
  this.counter=1;
  this.compiler(code, Fname, true);
}

/*
 * Check to see if a file is coffee script (using file extension)
 * either compile it or minify it
 *
 */
builder.prototype.compiler = function (code, name, root) {
  var self=this;
  function done (code) {
    self.require(code);
    debugger
    try {    
      code = jsmin("",code,1);
    }catch(e){ console.log(code); }
    self.code[root === true ? "_" : name] = code;
    self.count();
  }
  try {
    var suffix = /\.([a-zA-Z0-9]*)$/.exec(name)[1].toLowerCase();

    // if suffix is coffee then compile to js, otherwise minify the js
    try {
      switch(suffix) {
        case 'coffee':
          // this first one seems to hange the process
          //code = code.replace(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/g, "");
          // I know this is most likely not 100%, but it gets the comments out in the shared code
          code = code.replace(/\/\*([^*]|\*[^\/])*?\*\//g, "");
          var cofcomp = spawn('node', [__dirname + '/compilers/coffee/bin/coffee', '-sc']);
          var data="";
          cofcomp.stderr.on('data', function (d) {
            console.log("error", d);
            data += "throw " + JSON.stringify(d)+";";
          });
          cofcomp.stdout.on('data', function (d) { 
            data += d.toString();
          });
          cofcomp.on('exit', function () {
            done(data);
          });
          cofcomp.stdin.write(code);
          cofcomp.stdin.end();

          break;

          default:
            done(code);
      }
    }catch(e) {
      // report errors to users
      code = "throw "+JSON.stringify(e);
      done(code);
    }
  }catch(e){
    done(code);
  }
};

builder.prototype.require = function (code) {
  var self = this;
  code.replace(/require\s*?\((.*?)\)/g, function (r, v) {
    try {
      console.log("require: " + v);
      var name = v.replace(/\"(.*)\"|\'(.*)\'/, function (r) { return r.substring(1,r.length-1); });
      if(!self.need[name]) {
        self.need[name] = true;
        self.searcher(name);
      }
    }catch(e) {
      // no good way to get this back out
      //throw "Require needs to be static";
    }
    return r;
  });
};

// Search for a required module. such as require('fs')
// in this case input name=fs
builder.prototype.searcher = function (name) {

  // if user searches for their own file, look in the database
  // and compile and require the user's file
  // note: I deleted self.user already, leaving this code in
  // so that it can be adapted later
  if(name.indexOf("./") == 0) {
    this.counter++; // depth of require nesting (since user's own files)
    (function (name,self) {
      db.get("fs_"+self.user+"_"+name.substring(2), function (code) {
        if(code) 
          self.compiler(code,name);
        else {
          self.code[name] = "throw '"+name+" not found';";
          self.count();
        }
      });
    })(name, this);
  }
  // look in the modules.js to see if name is defined there
  else if(typeof modules[name] != "undefined") {}
  else
    this.code[name] = 'throw "Module '+name+' not found";';
};

builder.prototype.count = function () {
  // once we get back to the root, call the callback with 
  // the hash of code
  if(!--this.counter)
    this.callback(this.code);
};

exports.build = function (code, Fname, callback) {
  var b = new builder(code, Fname, callback);
};
