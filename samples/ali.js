
console.log("Ali.js: Starting");

count = 1

ss = setInterval(function(){
  console.log("Ali--.js: " + count);
  count++;
  if(count >= 100){
    clearInterval(ss);
  }
  
}, 200);
console.log("Ali.js: Ending");
