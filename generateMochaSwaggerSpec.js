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

let startTime = Date.now();

const chalk = require("chalk");
const commander = require("commander");
const fs = require("fs");
const path = require("path");
const envinfo = require("envinfo");
const packageJson = require("./package.json");
const parseTestDirectory = require("./parseTestDirectory");
let userPackageJson = null;
try {
  userPackageJson = JSON.parse(fs.readFileSync("package.json").toString());
  console.log(chalk.cyan("Auto filling project information."));
  console.log(
    chalk.green("Project Title:"),
    chalk.yellow(userPackageJson.name)
  );
  console.log(chalk.green("Version:"), chalk.yellow(userPackageJson.version));
  console.log(
    chalk.green("Description:"),
    chalk.yellow(userPackageJson.description)
  );
  console.log(chalk.green("Author:"), chalk.yellow(userPackageJson.author));
  console.log(chalk.green("License:"), chalk.yellow(userPackageJson.license));
} catch (error) {
  console.log(
    chalk.magenta(
      "Couldn't locate package.json file in this directory. Project information will be left empty in the generated spec."
    )
  );
}

let testDir;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments(`<test-directory>`)
  .usage(`${chalk.green("<test-directory>")} [options]`)
  .action(dir => {
    testDir = dir;
  })
  .option("--verbose", "print additional logs")
  .option("--info", "print environment debug info")
  .allowUnknownOption()
  .on("--help", () => {
    console.log(`    Only ${chalk.green("<test-directory>")} is required.`);
    console.log();
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
      `      ${chalk.cyan(
        "https://github.com/LmntrX/mocha-swagger/issues/new"
      )}`
    );
    console.log();
  })
  .parse(process.argv);

if (program.info) {
  console.log(chalk.bold("\nEnvironment Info:"));
  return envinfo
    .run(
      {
        System: ["OS", "CPU"],
        Binaries: ["Node", "npm", "Yarn"],
        Browsers: ["Chrome", "Edge", "Internet Explorer", "Firefox", "Safari"],
        npmGlobalPackages: ["mocha-swagger"]
      },
      {
        clipboard: true,
        duplicates: true,
        showNotFound: true
      }
    )
    .then(console.log)
    .then(() => console.log(chalk.green("Copied To Clipboard!\n")));
}

if (typeof testDir === "undefined") {
  console.error("Please specify the test directory:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("<test-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green("tests")}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

let routes = parseTestDirectory(testDir);
let swagger = {
  info: {
    title: userPackageJson ? userPackageJson.name : "",
    version: userPackageJson ? userPackageJson.version : "",
    description: userPackageJson ? userPackageJson.description : "",
    contact: {
      name: userPackageJson ? userPackageJson.author : ""
    },
    license: {
      name: userPackageJson ? userPackageJson.license : ""
    }
  },
  swagger: "2.0",
  paths: {}
};
routes.forEach(route => {
  if (!swagger.paths[route.path]) swagger.paths[route.path] = {};
  swagger.paths[route.path][route.method] = {
    summary: "",
    description: "",
    parameters: route.parameters,
    responses: {
      "200": {
        description: ""
      }
    }
  };
});
fs.writeFile("./swagger.json", JSON.stringify(swagger), function(err) {
  if (err) {
    return console.error(err);
  }

  console.log(
    chalk.green(
      "Swagger specification for your project was generated successfully! \nFilename:"
    ),
    chalk.yellow.underline.italic.bold(`${path.resolve(testDir)}/swagger.json`)
  );

  let endTime = Date.now();
  let diff = (endTime - startTime) / 1000;
  console.log(
    chalk.cyanBright(`Task completed in ${chalk.bold(diff)} seconds.`)
  );
});
