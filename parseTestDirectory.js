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

const path = require("path");
const glob = require("glob");
const chalk = require("chalk");
const fs = require("fs");
module.exports = dir => {
  const root = path.resolve(dir);
  const testDirName = path.basename(root);
  const testFileFormat = "/**/*.js";
  let routes = [];
  let files = glob.sync(`${testDirName}/${testFileFormat}`);
  if (!files || files.length <= 0) {
    console.log();
    console.error(
      chalk.red(`${testDirName} directory does not exist or is empty.`)
    );
    console.log();
    console.info(
      chalk.blue(`Please verify that your test files follow this format:`),
      chalk.yellow(testFileFormat)
    );
    return null;
  }
  files.forEach(file => {
    processFile(fs.readFileSync(file).toString());
  });

  function processFile(data) {
    let blocks = data.split("it");
    blocks.forEach(block => {
      let lines = block.split(".");
      let route = null;
      lines.forEach(line => {
        let method = null;
        if (line.includes("get")) {
          method = "get";
        } else if (line.includes("post")) {
          method = "post";
        } else if (line.includes("delete")) {
          method = "delete";
        } else if (line.includes("put")) {
          method = "put";
        } else if (line.includes("patch")) {
          method = "patch";
        }
        if (method) {
          let path = line.substring(line.indexOf("(") + 1, line.indexOf(")"));
          path = path.replace(/"/g, "");
          if (route) {
            route.method = method;
            route.path = path;
          } else
            route = {
              method: method,
              path
            };
        }
      });
      if (
        route &&
        !routes.find(r => {
          if (r.path === route.path && r.method === route.method) return true;
        })
      ) {
        if (route.path.startsWith("/")) routes.push(route);
        else {
          let d = data.replace(/\s/g, "").split(";");
          let actualPath = "";
          d.find(l => {
            if (l.includes(route.path)) {
              actualPath = l.split("=")[1].replace(/"/g, "");
              return true;
            }
          });

          route.path = actualPath;
          if (
            !routes.find(r => {
              if (r.path === route.path && r.method === route.method)
                return true;
            })
          )
            routes.push(route);
        }
      }
    });
  }

  return routes;
};
