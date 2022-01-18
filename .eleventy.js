const path = require("path");
const { gray, green, yellow } = require("kleur");
const stripColor = require("strip-color");

// TODO move these into plugin options instead
const FOLDER_ICON = "↘ ";
const FOLDER_ICON_SINGLE = "→ ";
const FILE_ICON = "• ";

// TODO move these into plugin options instead
const MAX_FOLDER_LENGTH = 20;
const MAX_FILENAME_LENGTH = 30;

const SPECIAL_FILE_KEY = "file:"

// TODO remove input directory from every entry in column 2
// TODO show preprocessor template language (shown in verbose output) e.g. .md files show (liquid)

function _pad(str, size, mode = "left") {
  let colorOffset = str.length - stripColor(str).length;
  size += colorOffset;

  let whitespace = Array.from({length: size}).join(" ") + " ";
  if(mode === "left") {
    return (str + whitespace).substr(0, size);
  }
  let result = whitespace + str;
  return result.substr(result.length - size);
}

function padLeftAlign(str, size) {
  return _pad(str, size, "left");
}

function padRightAlign(str, size) {
  return _pad(str, size, "right");
}

function truncate(str, maxLength) {
  if(maxLength && str.length > maxLength) {
    return str.substr(0, maxLength) + "[…]";
  }
  return str;
}

class Directory {
  constructor(options) {
    this.output = [];
    this.compileBenchmarksReported = {};
    this.options = options;
  }

  setConfigDirectories(dirs) {
    this.dirs = dirs;
  }

  print() {
    let colMax = [0, 0, 0, 0];
    for(let line of this.output) {
      let [location, inputFile, size, renderTime] = line;
      colMax[0] = Math.max(stripColor(location).length, colMax[0]);
      if(inputFile) {
        colMax[1] = Math.max(stripColor(inputFile).length, colMax[1]);
      }
      if(size) {
        colMax[2] = Math.max(stripColor(size).length, colMax[2]);
      }
      if(renderTime) {
        colMax[3] = Math.max(stripColor(renderTime).length, colMax[3]);
      }
    }

    for(let line of this.output) {
      let [location, inputFile, size, renderTime] = line;
      let cols = [
        padLeftAlign(location, colMax[0] + 2),
        padLeftAlign(inputFile ? `${inputFile}` : gray("--"), colMax[1] + 2),
      ];
      // TODO yellow/red color if larger than X KB
      if(this.options.columns && this.options.columns.filesize !== false) {
        cols.push(padRightAlign(size || gray("--"), colMax[2] + 2));
      }
      if(this.options.columns && this.options.columns.benchmark !== false) {
        cols.push(padRightAlign(renderTime ? renderTime : gray("--"), colMax[3] + 2));
      }

      console.log(
        ...cols
      );
    }
  }

  displayTime(ms) {
    return !isNaN(ms) ? ms.toFixed(1) + "ms" : "";
  }

  displayFileSize(size) {
    let sizeStr = (size / 1000).toFixed(1) + "kB";
    if(size && size > this.options.warningFileSize) {
      return yellow(sizeStr);
    }
    return sizeStr;
  }

  static normalizeLocation(location) {
    let result = {};
    let parsed = path.parse(location);

    let targetDir = parsed.dir;
    if(targetDir.startsWith("." + path.sep)) {
      targetDir = targetDir.substr(2);
    } else if(targetDir === ".") {
      targetDir = "";
    }

    result.dir = targetDir;

    if(result.dir.startsWith(path.sep)) {
      result.dir = result.dir.substr(1);
    }
    result.dir = result.dir.split(path.sep).map(entry => {
      return truncate(entry, MAX_FOLDER_LENGTH);
    }).join(path.sep);

    result.filename = truncate(parsed.name, MAX_FILENAME_LENGTH) + parsed.ext;

    return result;
  }

  // Hacky hack: For pagination templates, they are only compiled once per input file
  // so we just add to the first entry.
  _getCompileTime(meta) {
    let compileTime = 0;
    let key = meta.input.dir + path.sep + meta.input.filename;
    if(meta.benchmarks.compile && !this.compileBenchmarksReported[key]) {
      compileTime = meta.benchmarks.compile;

      this.compileBenchmarksReported[key] = true;
    }
    return compileTime;
  }

  getFileColumns(meta, depth = 0, prefix = "", icon = FILE_ICON) {
    let filename = meta.output.filename;
    if(prefix && filename.startsWith("index.html")) {
      filename = gray(filename);
    }

    let compileTime = this._getCompileTime(meta);
    return [
      `${padLeftAlign("", depth)}${icon}${prefix}${filename}`,
      `${meta.input.dir ? `${meta.input.dir}/` : ""}${meta.input.filename}`,
      this.displayFileSize(meta.size),
      this.displayTime(compileTime + meta.benchmarks.render),
    ];
  }

  static sortByKeys(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort((a, b) => {
      if(a.startsWith(SPECIAL_FILE_KEY) && !b.startsWith(SPECIAL_FILE_KEY)) {
        return 1;
      }
      if(b.startsWith(SPECIAL_FILE_KEY) && !a.startsWith(SPECIAL_FILE_KEY)) {
        return -1;
      }
      if(a < b) {
        return -1;
      }
      if(b > a) {
        return 1;
      }
      return 0;
    });

    for(let key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  parseResults(obj, depth = 0) {
    let sorted = Directory.sortByKeys(obj);
    for(let name in sorted) {
      let meta = sorted[name];
      if(name.startsWith(SPECIAL_FILE_KEY)) {
        let cols = this.getFileColumns(meta, depth);
        this.output.push(cols);
      } else {
        let children = Object.keys(meta);
        let files = children.filter(entry => entry.startsWith(SPECIAL_FILE_KEY));
        if(children.length === 1 && files.length === 1) {
          let childFile = meta[files[0]];
          let cols = this.getFileColumns(childFile, depth, green(name + "/"), FOLDER_ICON_SINGLE);
          this.output.push(cols);
        } else {
          let cols = [
            `${padLeftAlign("", depth)}${FOLDER_ICON}${green(name + "/")}`
          ];
          this.output.push(cols);

          this.parseResults(meta, depth + 2);
        }
      }
    }
  }
}

module.exports = function(eleventyConfig, opts = {}) {
  let options = Object.assign({
    warningFileSize: 400 * 1000, // bytes
    columns: {}
  }, opts);

  let configDirs = {};
  eleventyConfig.on("eleventy.directories", function(dirs) {
    configDirs = dirs;
  });

  let results = {};
  eleventyConfig.on("eleventy.before", function() {
    results = {};
  });
  eleventyConfig.on("eleventy.after", function() {
    let d = new Directory(options);
    d.setConfigDirectories(configDirs);
    d.parseResults(results);
    d.print();
  });

  function getBenchmarks(inputPath, outputPath) {
    let benchmarks = {};
    let keys = {
      render: `> Render > ${outputPath}`,
      compile: `> Compile > ${inputPath}`,
    };

    if(eleventyConfig.benchmarkManager) {
      let benchmarkGroup = eleventyConfig.benchmarkManager.get("Aggregate");

      if("has" in benchmarkGroup && benchmarkGroup.has(keys.render)) {
        let b1 = benchmarkGroup.get(keys.render);
        benchmarks.render = b1.getTotal();
      }

      if("has" in benchmarkGroup && benchmarkGroup.has(keys.compile)) {
        let b2 = benchmarkGroup.get(keys.compile);
        benchmarks.compile = b2.getTotal();
      }
    }

    return benchmarks;
  }

  eleventyConfig.addLinter("directory-output", function(content) {
    if(this.outputPath === false || typeof content !== "string") {
      return;
    }
    let inputLocation = Directory.normalizeLocation(this.inputPath);
    let outputLocation = Directory.normalizeLocation(this.outputPath);
    let [...dirs] = outputLocation.dir.split(path.sep);

    let obj = {
      input: inputLocation,
      output: outputLocation,
      size: content.length,
      benchmarks: getBenchmarks(this.inputPath, this.outputPath),
    };

    let target = results;
    for(let dir of dirs) {
      if(!target[dir]) {
        target[dir] = {};
      }
      target = target[dir];
    }
    target[`${SPECIAL_FILE_KEY}${outputLocation.filename}`] = obj;
  });
}
