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
const ProgressBar = require("progress");
module.exports = dir => {
  const root = path.resolve(dir);
  const testDirName = path.basename(root);
  const testFileFormats = ["/**/*.js", "/**/*.ts"];
  let routes = [];
  testFileFormats.forEach(testFileFormat => {
    let files = glob.sync(`${testDirName}/${testFileFormat}`);
    if (!files || files.length <= 0) {
      console.warn(
        chalk.magenta(
          `${testDirName} directory does not contain files matching pattern ${testFileFormat}`
        )
      );
      return null;
    }
    console.info(
      chalk.cyan(`Parsing files matching pattern ${testFileFormat}`)
    );
    var bar = new ProgressBar("  processing [:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      total: files.length * 2,
      renderThrottle: 0
    });
    files.forEach(file => {
      processFile(fs.readFileSync(file).toString());
      bar.tick(2);
    });
  });

  function processFile(data) {
    let blocks = data.split("it");
    blocks.forEach(block => {
      let lines = block.split(".");
      let route = null;
      lines.forEach((line, index) => {
        let method = null;
        if (line.includes("`") && !line.includes("$")) {
          line = line.replace(/`/g, '"').trim();
        }
        if (line.includes("+")) {
          line =
            line.substring(0, line.indexOf('" +')) +
            ":" +
            (lines[index + 1].includes("(")
              ? line.substring(line.indexOf('" +') + 3, line.length).trim()
              : lines[index + 1].substring(0, lines[index + 1].indexOf(")"))) +
            '")';
        }
        if (line.includes("`") && line.includes("$")) {
          method = null;
        } else if (line.startsWith("get")) {
          method = "get";
        } else if (line.startsWith("post")) {
          method = "post";
        } else if (line.startsWith("delete")) {
          method = "delete";
        } else if (line.startsWith("put")) {
          method = "put";
        } else if (line.startsWith("patch")) {
          method = "patch";
        }
        if (method) {
          let parameters = [];
          let path = line.substring(line.indexOf("(") + 1, line.indexOf(")"));
          path = path.replace(/"/g, "");
          if (path.includes(":")) {
            path = path.replace(/:/g, "{");
            path = path.replace(/{\//g, "}");
            path = path + "}";
            parameters = [
              {
                in: "path",
                required: true,
                type: "string",
                name: path.substring(path.indexOf("{") + 1, path.indexOf("}"))
              }
            ];
          }
          if (route) {
            route.method = method;
            route.path = path;
            route.parameters = parameters;
          } else
            route = {
              method,
              path,
              parameters
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
