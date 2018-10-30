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

const chalk = require("chalk");
const commander = require("commander");
const spawn = require("cross-spawn");
const os = require("os");
const envinfo = require("envinfo");
const packageJson = require("./package.json");
const validateTestDirectory = require("./ValidateTestDirectory");

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

validateTestDirectory(testDir);
