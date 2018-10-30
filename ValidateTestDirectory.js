const path = require("path");
const glob = require("glob");
const chalk = require("chalk");
const fs = require("fs");
module.exports = dir => {
  const root = path.resolve(dir);
  const testDirName = path.basename(root);
  const testFileFormat = "/**/*.js";
  let routes = [];
  glob(`${testDirName}/${testFileFormat}`, null, function(er, files) {
    if (er) {
      console.log();
      console.error(chalk.red(er));
      return;
    }
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
      return;
    }
    files.forEach(file => {
      processFile(fs.readFileSync(file).toString());
    });
    console.log(routes);
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
};
