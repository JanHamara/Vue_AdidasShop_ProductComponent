"use strict";

function defaultTask() {
  var initMessage = "Loaded Gulp";
  console.log(initMessage);
  return initMessage;
}

exports["default"] = defaultTask;