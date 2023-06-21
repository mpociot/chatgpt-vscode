# ChatGPT Extension for VSCode

This Visual Studio Code extension allows you to use the [unofficial ChatGPT API](https://github.com/transitive-bullshit/chatgpt-api) to generate natural language responses from OpenAI's [ChatGPT](https://chat.openai.com/chat) to your questions, right within the editor.

## Sponsors

[What The Diff](https://whatthediff.ai/?ref=gh-chatgpt) - your AI powered code review assistant

[![What The Diff](https://whatthediff.ai/images/card.png)](https://whatthediff.ai/?ref=gh-chatgpt)


### [Marketplace](https://marketplace.visualstudio.com/items?itemName=timkmecl.chatgpt)

<br>

<img src="examples/main.png" alt="Refactoring selected code using chatGPT"/>

## Update

Updated to use version `5.2.x` of [ChatGPT API](https://www.npmjs.com/package/chatgpt) Node.js library with support for GPT-4 using an API key instead of the old session key.

## Features
- **Ask general questions** or use code snippets from the editor to query ChatGPT via an input box in the sidebar
- Right click on a code selection and run one of the context menu **shortcuts**
- View ChatGPT's responses in a panel next to the editor
- Ask **follow-up questions** to the response (conversation context is maintained)
- **Insert code snippets** from the AI's response into the active editor by clicking on them


## Installation

To use this extension, install it from the VSCode marketplace or download and install `.vsix` file from Releases.

1. After the installation is complete, you will need to add your ChatGPT API key to the extension settings in VSCode. To do this, open the `Settings` panel by going to the `Code` menu and selecting `Preferences`, then `Settings`.
2. In the search bar, type `ChatGPT` to filter the settings list.
3. In the ChatGPT section, enter your API key in the `API_KEY` field.

Optionally add

- `Model`
- `Temperature`
- `TopP`

This lets you fine-tune how your instance of `ChatGPTAPI` is created, similar to:

```ts
const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  completionParams: {
    model: 'gpt-4',
    temperature: 0.5,
    top_p: 0.8
  }
})
```

After completing these steps, the extension should be ready to use. 

### Obtaining the API key

To use this extension, you will need to authenticate with a valid API key from ChatGPT. To get an API key:

1. Go to https://chat.openai.com/chat and log in or sign up.
2. Go to Profile -> View API keys
3. Create new secret key 

See [How to get ChatGPT API key](https://elephas.app/blog/how-to-get-chatgpt-api-key-clh93ii2e1642073tpacu6w934j)

Once you have obtained a API key, you can configure the extension to use it as described in the previous section.

### Run ChatGPT retrieval plugin

The modified ChatGPT retrieval plugin can be found in the retrieval folder.
To set it up, following these steps in the terminal:

```
cd retrieval
pip install poetry
poetry env use python3.10
poetry shell
poetry install
```

Set your environment variables

```bash
export DATASTORE=pinecone
export BEARER_TOKEN=<your_database_interface_api_key>
export OPENAI_API_KEY=<your_openai_api_key>
export PINECONE_API_KEY=<your_pinecone_api_key>
export PINECONE_ENVIRONMENT=<your_pinecone_region_name>
export PINECONE_INDEX=<your_index_name>
```

Other environment variables

```bash
DATABASE_INTERFACE_BEARER_TOKEN=<your DB token>
BASE_API_URL=http://0.0.0.0:8000
PROJECT_PATH=<full path to your project root path>
GPT_MODEL=<chatGPT model to use>
```

`GPT_MODEL` is the ChatGPT model to use, defaulting to `gpt-3.5-turbo`.

`DATABASE_INTERFACE_BEARER_TOKEN` should be the same as `BEARER_TOKEN`. It is the token used with OAuth2 to authenticate with the DB.

`BASE_API_URL` is the root URL of the Python FastAPI server which defaults to `http://0.0.0.0:8000`

`PROJECT_PATH` is used by the file agent to correctly determine relative file path of a changed file relative to the project root. 

### Run Database Interface Server

Then run `poetry run start` in the `/retrieval` folder

```bash
retrieval $ poetry run start
```

It will start your Database Interface server. Open your browser and open `http://0.0.0.0:8000/docs#/`. 

If the page is up, you have successfully implemented the Database Interface module with Retrieval Plugin.

## Using Vector Database to store code base

The goal is to use an architecture similar to [chatgpt with external memory using vector database](https://betterprogramming.pub/enhancing-chatgpt-with-infinite-external-memory-using-vector-database-and-chatgpt-retrieval-plugin-b6f4ea16ab8)

[![Vector DB architecture](/resources/VectorDB-architecture.webp)

This will additionally use LangChain to chunk code files using a [Code splitter](https://python.langchain.com/en/latest/modules/indexes/text_splitters/examples/code_splitter.html) specific to the language of the code file being processed.

We will need an agent running in the project root directory in the background to monitor file changes. For each file change it should call the API to `upsert` or `delete` vectors in the Vector Database so that this DB is always in sync with the project. 

It should only take into account files that are "source files" of the project. To achieve this, we can use `.gitignore` or `.npmignore` files along with a custom configuration.

### Chokidar agent with ignore files

We can use [chokidar](https://github.com/paulmillr/chokidar) as a battle-tested agent to monitor the file system for changes using file, dir, glob, or array of files to match.

```ts
// Initialize watcher.
const watcher = chokidar.watch('file, dir, glob, or array', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Something to use when events are received.
const log = console.log.bind(console);
// Add event listeners.
watcher
  .on('add', path => log(`File ${path} has been added`))
  .on('change', path => log(`File ${path} has been changed`))
  .on('unlink', path => log(`File ${path} has been removed`));
```

For any `add` or `change` we will call the `upsert` endpoint of the FastAPI python API for the modified [GPT Retrieval Plugin](https://github.com/openai/chatgpt-retrieval-plugin.git).

For `unlink` of files (ie. deletion of a file) we call the `delete` endpoint.

Doing this, we can keep the Vector DB in sync with the file system of code base.

We will use [ignoring-watcher](https://www.npmjs.com/package/ignoring-watcher) as a convenient wrapper of Chokidar :)

The `file_agent.js` can be found in `src` and can be run simply via node:

Copy the `agent` folder of this repo to the root of your project folder:
- `file-agent.js` 
- `agent-sync.js`
- `run-agent`
- `package.json`

The programming language will be detected based on the [languagemap](https://github.com/blakeembrey/language-map/blob/main/languages.json) based on Github's [linguist yaml language file](https://github.com/github-linguist/linguist/blob/master/lib/linguist/languages.yml)


Alternative node lang detectors:
- [lang-detector](https://www.npmjs.com/package/lang-detector)
- [language-detect](https://www.npmjs.com/package/language-detect)
- [flourite](https://www.npmjs.com/package/flourite)
- [program-language-detector](https://www.npmjs.com/package/program-language-detector)

```bash
npm install ignoring-watcher detect-programming-language -D`
```

### Run file agent in your project

`node agent/file_agent.js`

or via script (see `scripts` section in `agent/package.json`):

`npm run file-agent`


## Code chunks

This extension intends to use LangChain [CodeSplitter](https://python.langchain.com/en/latest/modules/indexes/text_splitters/examples/code_splitter.html) to split the code files as code.

A custom TypeScript splitter is included in `src/typescript-textsplitter.js`. 
A TypeScript splitter is also included as python code in `services/typescript-textsplitter.py`

They both have a static `build` method that takes a dictionary of options.

Typescript variant

```ts
splitter = TypescriptTextSplitter.build(opts)
tsDocs = splitter.create_documents([code])
return tsDocs
```

Python variant

```py
splitter = TypescriptTextSplitter.build(opts)
ts_docs = splitter.create_documents([code])
return ts_docs
```

The retrieval plugin uses a normal text splitter for text files but uses LangChain CodeSplitter when encountering files with an extension matching a programming language.

Currently the file agent sends a special `language` metadata field as part of the `upsert` API call which can be used for chunking code files using an appropriate splitter.

The agent will call the `upsert_file` Python API with the following meta-info based on the file path. 

This meta is determined on a "best effort" basis (some basic assumptions/rules), that can be customized as needed for the particular project.

```ts
  const meta = {
    path: filePath,
    language, // from Github's languagemap
    langCode, // matches supported language codes for LangChain CodeSplitter lookup
    config: isConfig,
    test: isTest, 
    markdown: isMarkdown, 
    documentation: isDocumentation,
    source: isSrc
  };
```

`language` will be picked up on the Python API side in `upsert` and is set, it will be used for code splitting (chunking) based on LangChain's language specific chunk separators and rules.

Yet another approach would be to use the python library [guesslang](https://github.com/yoeo/guesslang) to guess the language of the document text based on Tensorflow machine learning framework (See [how does guesslang guess](https://guesslang.readthedocs.io/en/latest/contents.html#how-does-guesslang-guess))

> "Guesslang detects the programming language of a given source code. It supports more than 50 programming languages and detects the correct programming language with more than 90% accuracy."

### Upsert file

The upsert file Python logic is shown here for reference. First the Metadata is parsed into a `metadata_obj` that adheres to `DocumentMetadata` (see further below).

This `metadata_obj` is then used to get a full `document` object (of type `Document`) from the file. This document is then stored in the Vector DB. 

```py
async def upsert_file(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
):
    try:
        metadata_obj = (
            DocumentMetadata.parse_raw(metadata)
            if metadata
            else DocumentMetadata(source=Source.file)
        )
    except:
        metadata_obj = DocumentMetadata(source=Source.file)

    document = await get_document_from_file(file, metadata_obj)

    try:
        ids = await datastore.upsert([document])
        return UpsertResponse(ids=ids)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=f"str({e})")
```

In the Python API `upsert` calls `get_document_chunks`, which calls `create_document_chunks` which calls `get_text_chunks`

### Create document chunks

`create_document_chunks` gets a document of the type `Document`

```py
class Document(BaseModel):
    id: Optional[str] = None
    text: str
    metadata: Optional[DocumentMetadata] = None
```

`DocumentMetadata` has been expanded to contain some fields to specify more information regarding the particular document, to answer questions such as:

- What is the local file path of the document?
- What programming language is used?
- Is it part of test suite?
- Is it a configuration file?
- Is it a source file?
- Is it part of project documentation?
- Is it a markdown file?

```py
class DocumentMetadata(BaseModel):
    source: Optional[Source] = None
    source_id: Optional[str] = None
    path: Optional[str] = None
    langCode: Optional[str] = None
    language: Optional[str] = None
    config: Optional[bool] = None
    test: Optional[bool] = None
    source: Optional[bool] = None
    documentation: Optional[bool] = None
    markdown: Optional[bool] = None
    url: Optional[str] = None
    created_at: Optional[str] = None
    author: Optional[str] = None
```

These fields have also been expanded into the filter:

```py
class DocumentMetadataFilter(BaseModel):
    document_id: Optional[str] = None
    path: Optional[str] = None
    langCode: Optional[str] = None
    language: Optional[str] = None
    config: Optional[bool] = None
    test: Optional[bool] = None
    source: Optional[bool] = None
    documentation: Optional[bool] = None
    markdown: Optional[bool] = None
    source: Optional[Source] = None
    source_id: Optional[str] = None
    author: Optional[str] = None
    start_date: Optional[str] = None  # any date string format
    end_date: Optional[str] = None  # any date string format
```

Based on the metadata for the document it can decide which chunker (splitter) to use and how to populate the VectorDB with powerful metadata for use by the AI and embeddings search etc.

## Using the Extension

To use the extension, open a text editor in Visual Studio Code and open the ChatGPT panel by clicking on the ChatGPT icon in the sidebar. This will open a panel with an input field where you can enter your prompt or question. By clicking enter, it will be sent to ChatGPT. Its response will be displayed below the input field in the sidebar (note that it may take some time for it to be calculated).

<img src="examples/create.png" alt="Writing new code using chatGPT" width="500"/>

You can also select a code snippet in the editor and then enter a prompt in the side panel, or right-click and select "Ask ChatGPT". The selected code will be automatically appended to your query when it is sent to the AI. This can be useful for generating code snippets or getting explanations for specific pieces of code.

<img src="examples/explain.png" alt="Refactoring selected code using chatGPT"/>

To insert a code snippet from the AI's response into the editor, simply click on the code block in the panel. The code will be automatically inserted at the cursor position in the active editor.

<img src="examples/refactor.png" alt="chatGPT explaining selected code"/>

You can select some code in the editor, right click on it and choose one of the following from the context menu:
#### Commands:
- `Ask ChatGPT`: will provide a prompt for you to enter any query
- `ChatGPT: Explain selection`: will explain what the selected code does
- `ChatGPT: Refactor selection`: will try to refactor the selected code
- `ChatGPT: Find problems`: looks for problems/errors in the selected code, fixes and explains them
- `ChatGPT: Optimize selection`: tries to optimize the selected code

`Ask ChatGPT` is also available when nothing is selected. For the other four commands, you can customize the exact prompt that will be sent to the AI by editing the extension settings in VSCode Preferences.


Because ChatGPT is a conversational AI, you can ask follow-up questions to the response. The conversation context is maintained between queries, so you can ask multiple questions in a row. 
To **reset the conversation context**, click `ctrl+shift+p` and select `ChatGPT: Reset Conversation`.

---

Please note that this extension is currently a proof of concept and may have some limitations or bugs. We welcome feedback and contributions to improve the extension.

## Credits

- This wouldn't be possible without OpenAI's [ChatGPT](https://chat.openai.com/chat)
- The extension makes use of [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api) (by [Travis Fischer](https://github.com/transitive-bullshit)), which uses ChatGPT unofficial API in order to login and communicate with it.
- It is built on top of [mpociot/chatgpt-vscode](https://github.com/mpociot/chatgpt-vscode), which started this project
- `v0.3` inspired and based on [barnesoir/chatgpt-vscode-plugin](https://github.com/barnesoir/chatgpt-vscode-plugin) and [gencay/vscode-chatgpt](https://github.com/gencay/vscode-chatgpt)
