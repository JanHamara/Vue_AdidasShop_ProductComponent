"use strict";

var cb = function cb(initMessage) {
  return console.log(initMessage);
};

function defaultTask(cb) {
  var initMessage = "Loaded Gulp";
  cb(initMessage);
}

exports["default"] = defaultTask;