const sync = require("./agent-sync");
const getPath = require("path");
const watcher = require('ignoring-watcher');
const getProgrammingLanguage = require("detect-programming-language");

function getMeta(path) {
  const ext = getPath.extname(path);
  const isTest = false;
  if (path.match(/tests?.\//)) {
    isTest = true;
  }
  if (ext.match(/\.test\./)) {
    isTest = true;
  }
  if (ext.match(/\.spec\./)) {
    isTest = true;
  }
  
  if (ext.match(/\.spec\./)) {
    isTest = true;
  }
  
  isSrc = false;
  if (path.match(/src\//) || path.match(/source\//) || path.match(/libs?\//)) {
    isSrc = true;
  }

  isConfig = false;
  if (path.match(/configs?\//) || path.match(/configurations?\//)) {
    isConfig = true;
  }
  if (ext.match(/\.ya?ml/)) {
    isConfig = true;
  }
  if (ext.match(/\.json/)) {
    isConfig = true;
  }
  if (ext.match(/\.xml/)) {
    isConfig = true;
  }
  if (ext.match(/\.ini/)) {
    isConfig = true;
  }
  if (ext.match(/\.env/)) {
    isConfig = true;
  }

  isMarkDown = false;
  if (['.md', '.mkd', '.mkdown', '.markdown'].includes(ext)) {
    isMarkDown = true;
  }
  // to be improved w doc/docs folder etc
  isDocumentation = false;
  if (isMarkDown) {
    isDocumentation = true;
  }
  
  const language = getProgrammingLanguage(ext);
  
  const langMap = {
    'C++': 'cpp',
    'C#': 'java',
    Go: 'go',  
    Java: 'java',  
    Javascript: 'js',  
    JSX: 'js',
    Typescript: 'typescript',
    TSX: 'typescript',
    PHP: 'php',  
    Proto: 'proto',
    Python: 'python',  
    reStructuredText: 'rst',  
    Ruby: 'ruby',
    Rust: 'rust',
    Scala: 'scala',
    Swift: 'swift',
    Markdown: 'markdown',
    Latex: 'latex',
    HTML: 'html'
  };

  const langCode = langMap[language];

  const meta = {
    path: filePath,
    language, 
    langCode,
    config: isConfig,
    test: isTest, 
    markdown: isMarkdown, 
    documentation: isDocumentation,
    source: isSrc
  };
  return meta;
}

function startWatcher(dir) {

  const ignoringWatcher = watcher.createWatcher({
    // Directory to watch. Defaults to process.cwd()
    dir: dir || sync.projPath,
 
    // Watch multiple directories instead of a single dir
    dirs: ['some/dir', 'another/dir'],
 
    // One or more ignore patterns
    ignorePatterns: [
        '/node_modules',
    ],
 
    // The ignore patterns from these ignore files will all
    // be loaded and joined together
    ignoreFiles: [
        '.gitignore',
        '.npmignore'
    ],
 
    // Only the first existing ignore file (if any) will be loaded and merged
    selectIgnoreFile: [
        '.gitignore',
        '.npmignore'
    ],
 
    // If no ignore patterns were found via the other properties
    // then these ignore patterns will be used
    defaultIgnorePatterns: [
        '.*',
        '*.lock'
    ],
 
    // The following patterns will always be loaded and not impact
    // the loading of the `defaultIgnorePatterns`
    ignoreAlwaysPatterns: [
        'log.*', // no need to use log files
        '*.lock', // no need to use lock files
        '/temp/*' // no need to look at anything in temp folder
    ]
  });

  ignoringWatcher
    .on('modified', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        // var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var filePath = eventArgs.path; // The full file system path of the modified file
        const meta = getMeta(path);
        sync.upsertFile(filePath, meta);
    });
  ignoringWatcher    
    .on('add', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        // var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var filePath = eventArgs.path;        
        const meta = getMeta(path);
        sync.upsertFile(filePath, meta);
    });

  ignoringWatcher        
    .on('unlink', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        // var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var filePath = eventArgs.path; // The full file system path of the modified file
        sync.deleteFile(filePath);
    });

  ignoringWatcher.startWatching(); 
}

startWatcher();

