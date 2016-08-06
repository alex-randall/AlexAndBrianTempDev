/// <binding AfterBuild='default' />
"use strict";

var fs = require("fs"), 
    customGulpTaskPath = "./build/",
    customGulpTaskFileNames = fs.readdirSync(customGulpTaskPath, "utf8");

// execute all js files in the root ./gulp/ to 
// immediately define all custom gulp tasks
customGulpTaskFileNames.forEach(function(customGulpTaskFileName) {
  if (customGulpTaskFileName !== "common") {  
    require(customGulpTaskPath + customGulpTaskFileName);
  }  
});