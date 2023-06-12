var ignoringWatcher = require('ignoring-watcher').createWatcher({
    // Directory to watch. Defaults to process.cwd()
    dir: __dirname,
 
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
        '.*'
    ],
 
    // The following patterns will always be loaded and not impact
    // the loading of the `defaultIgnorePatterns`
    ignoreAlwaysPatterns: [
        'log.*',
        '/temp/*'
    ]
});

const baseApiUrl = process.env.BASE_API_URL || 'http://0.0.0.0:8000';

const requestUpsertFile = async (filePath, fileOpts = {}, headers = {}) => {
    try {
      const file = fs.createReadStream(filePath);
      const filePath = filePath;
    
      const form = new FormData();
      form.append('title', title);
      form.append('filePath', filePath);
      // iterate opts with extra metadata
    
      const resp = await axios.post(`${baseApiUrl}/upsert-file`, form, {
        headers: {
          ...form.getHeaders(),
          ...headers || {}
        }
      });
    
      if (resp.status === 200) {
        return 'Upload complete';
      } 
    } catch(err) {
      return new Error(err.message);
    }
};

// ids or request.filter or request.delete_all
const requestDelete = async (filePath, fileOpts = {}, headers = {}) => {
    try {
      const filePath = filePath;
    
      const form = new FormData();
      //     
        // ids: Optional[List[str]] = None
        // filter: Optional[DocumentMetadataFilter] = None
        // delete_all: Optional[bool] = False

        // DocumentMetadataFilter
        // document_id: Optional[str] = None
        // source: Optional[Source] = None
        // source_id: Optional[str] = None
    
      form.append('ids', [filePath]);
      // form.append('filter', filePath);
      // iterate opts with extra metadata
    
      const resp = await axios.post(`${baseApiUrl}/delete`, form, {
        headers: {
          ...form.getHeaders(),
          ...headers || {}
        }
      });
    
      if (resp.status === 200) {
        return 'Delete complete';
      } 
    } catch(err) {
      return new Error(err.message);
    }
};


  
const accessToken = process.env.DATABASE_INTERFACE_BEARER_TOKEN;

const headers = {
    "Authorization": "Bearer " + accessToken // token
};

async function upsertFile (filePath) {
    const response = await requestUpsertFile(filePath, {}, headers);
    console.log(response);
};

async function deleteFile (filePath) {
    const response = await requestDelete(filePath, {}, headers);        
    console.log(response);
};


ignoringWatcher
    .on('modified', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var path = eventArgs.path; // The full file system path of the modified file
        upsertFile(filePath);
    });
ignoringWatcher    
    .on('add', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var path = eventArgs.path; // The full file system path of the modified file
        upsertFile(filePath);
    });

ignoringWatcher        
    .on('unlink', function(eventArgs) { // Fired for any change event (add, delete, etc.)
        var type = eventArgs.type; // add | addDir | change | unlink | unlinkDir
        var path = eventArgs.path; // The full file system path of the modified file
        deleteFile(filePath);
    });
    
ignoringWatcher.startWatching(); 