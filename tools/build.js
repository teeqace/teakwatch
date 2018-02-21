const BUILD_COMMAND = '/Applications/CocosCreator.app/Contents/MacOS/CocosCreator';

const chalk = require('chalk');
const config = require('config');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const dateFormat = require('dateformat');
const minimist = require('minimist');
const walk = require('walk-promise');
const execFile = require('child_process').execFile;
const pngquant = require('pngquant-bin');
const zipdir = require('zip-dir');
const Curl = require('node-libcurl').Curl;
const childProcess = require('child_process');
const templateName = config.get('postbuild.template');
const mapping = config.get('postbuild.mapping');
const createSourceMap = config.get('postbuild.sourceMap');
const compressionBlacklist = config.has('postbuild.compression_blacklist') ? config.get('postbuild.compression_blacklist') : [];

const argv = minimist(process.argv.slice(2));

const skipPng = argv['skip-png'];
const skipBuild = argv['skip-build'];
const verbose = argv['verbose'];

const facebookAppId = config.get('postbuild.facebookAppId');
const facebookUploadAccessToken = config.get('postbuild.facebookUploadAccessToken');

let templatePath = path.join(__dirname, 'templates', templateName);
let buildPath = path.resolve(path.join(__dirname, '../build'));
let basePath = path.join(buildPath, 'web-mobile');
let mainFilePath = path.join(basePath, 'index.html');

function buildGame() {
  if (skipBuild) {
    console.log(chalk.yellow('Skipping build...'));
    return;
  }
  console.log(chalk.yellow('Building Game...'));
  return new Promise((resolve, reject) => {
    let args = [
      '--path', '.',
      '--build',
      'platform=web-mobile;configPath=./settings/builder.json' + createSourceMap ? ';sourceMap=true' : ''
    ];
    let options = {
      cwd: path.resolve(path.join(__dirname, '..'))
    };

    execFile(BUILD_COMMAND, args, options, (err, stdout) => {
      if (verbose) {
        console.log(stdout);
      }
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function zipFileAsync(src, dest) {
  console.log(chalk.yellow('Creating zip package...'));
  return new Promise((resolve, reject) => {
    zipdir(src, { saveTo: dest }, function(err, buffer) {
      if (err) {
        reject();
      } else {
        resolve(dest);
      }
    });
  });
}

function getPackageName() {
  return templateName + '-' + config.util.getEnv('NODE_ENV') + '-' + dateFormat(new Date(), 'yyyymmdd-hhmmss') + '.zip';
}

function handleFile(fileInfo) {

  let fullPath = path.join(fileInfo.root, fileInfo.name);
  let relativePath = fullPath.replace(basePath, '');
  let originalSize;

  //console.log('Processing:', relativePath);
  if (compressionBlacklist[relativePath] === 'none') {
    // console.log('Skipping:', relativePath);
    return Promise.resolve();
  } else {
    return fs.stat(fullPath)
      .then((stat) => {
        originalSize = stat.size;
        let options = ['--ext=.png', '--force', fullPath];
        let blacklistItem = compressionBlacklist[relativePath];
        if (blacklistItem) {
          let matches = blacklistItem.match(/^[0-9]{1,3}$/);
          if (matches) {
            options.push(blacklistItem);
          } else {
            console.log(chalk.red('Warning: Compression option incorrect : ' + relativePath));
          }
          // console.log(options);
        }
        options.push(fullPath);
        return new Promise((resolve, reject) => {
          execFile(pngquant, ['--ext=.png', '--force', fullPath], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })
      .then(() => {
        return fs.stat(fullPath);
      })
      .then((stat) => {
      //console.log('  ', originalSize, ' > ', stat.size);
      });
  }
}

function getGitHash() {
  return new Promise((resolve, reject) => {
    childProcess.exec('git rev-parse HEAD', (err, stdout) => {
      if (!err) {
        resolve(stdout);
      } else {
        reject(err);
      }
    });
  });
}

function upload(file) {
  getGitHash().then((hash) => {
    return new Promise((resolve, reject) => {
      let curl = new Curl();
      curl.setOpt(Curl.option.URL, `https://graph-video.facebook.com/${facebookAppId}/assets`);
      curl.setOpt(Curl.option.HTTPPOST, [
        { name: 'asset', file: file, type: 'application/octet-stream' },
        { name: 'access_token', contents: facebookUploadAccessToken },
        { name: 'type', contents: 'BUNDLE' },
        { name: 'comment', contents: hash },
      ]);
      curl.on('end', () => {
        curl.close.bind(curl);
        resolve();
      });
      curl.on('error', (err) => {
        curl.close.bind(curl);
        reject(err);
      });
      curl.perform(); 
    });
  });
}

console.log(chalk.yellow('Building for:'), templateName);

Promise.resolve()
  .then(() => {
    return buildGame();
  })
  .then(() => {
    // Step 1: Overwrite build directory with template directory
    return fs.copy(templatePath, basePath);
  })
  .then(() => {
    // Step 2: Read main file (index.html)
    return fs.readFile(mainFilePath, 'utf-8');
  })
  .then((content) => {
    // Step 3: Overwrite file by inserting template value
    for (let key in mapping) {
      let value = mapping[key];
      content = content.replace('{{{' + key + '}}}', value);
    }
    return fs.writeFile(mainFilePath, content);
  })
  .then(() => {
    if (skipPng) {
      console.log(chalk.yellow('Skipping PNG compression'));
      return;
    }
    // Step 4: List PNG files for compression
    console.log(chalk.yellow('Compressing PNGs'));
    return walk(basePath);
  })
  .then((files) => {
    if (skipPng) {
      return;
    }
    // Step 5: Perform PNG compression
    let imageFiles = files.filter((file) => {
      return file.name.match(/\.png$/);
    });
    return Promise.mapSeries(imageFiles, handleFile);
  })
  .then(() => {
    // Step 6: Create zip archive
    return zipFileAsync(basePath, path.join(buildPath, getPackageName()));
  })
  .then((file) => {
    if (facebookAppId && facebookUploadAccessToken) {
      return upload(file);
    } else {
      return Promise.resolve();
    }
  })
  .then(() => {
    console.log(chalk.green('Build completed'));
  })
  .catch((err) => {
    console.log(chalk.red('Error building game:\n' + err + '\n' + err.stack));
  });