#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Lmntrx Tech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// mochaswagger-gen is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `mochaswagger-gen` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of mochaswagger-gen.
//
// Also be careful with new language features.
// This file must work on Node 0.10+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

"use strict";

var chalk = require("chalk");

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];

if (major < 8) {
  console.error(
    chalk.red(
      "You are running Node " +
        currentNodeVersion +
        ".\n" +
        "MochaSwagger-Gen requires Node 8 or higher. \n" +
        "Please update your version of Node."
    )
  );
  process.exit(1);
} else {
  console.info(
    chalk.green(
      "Your version of Node " + currentNodeVersion + " is compatible."
    )
  );
}

require("./generateMochaSwaggerSpec");
