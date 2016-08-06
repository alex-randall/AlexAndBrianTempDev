/// <binding AfterBuild='default' />
"use strict";

// gulpfile.js
//
// defines all custom gulp tasks for this project  

// declare global variable
global.RedirectBannerVersion = "1.0.0";

// define/include NPM thing we need (the filesystem component fs)
var fs = require("fs"), 

    // setup a string constant
    customGulpTaskPath = "./build/",

    // get the names of all files and folders in the root of the ./build/ folder 
    customGulpTaskFileNames = fs.readdirSync(customGulpTaskPath, "utf8");

// immediately define all custom gulp tasks by looping through 
// all names of files and folders in the root ./build/ folder 
// and requiring them if they are not the common folder
// this, in effect, executes the file and defines the gulp tasks for this project
customGulpTaskFileNames.forEach(function(customGulpTaskFileName) {
  if (customGulpTaskFileName !== "common") {  
    require(customGulpTaskPath + customGulpTaskFileName);
  }  
});