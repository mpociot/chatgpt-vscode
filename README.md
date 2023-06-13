# ChatGPT Extension for VSCode

This Visual Studio Code extension allows you to use the [unofficial ChatGPT API](https://github.com/transitive-bullshit/chatgpt-api) to generate natural language responses from OpenAI's [ChatGPT](https://chat.openai.com/chat) to your questions, right within the editor.

## Sponsors

[What The Diff](https://whatthediff.ai/?ref=gh-chatgpt) - your AI powered code review assistant

[![What The Diff](https://whatthediff.ai/images/card.png)](https://whatthediff.ai/?ref=gh-chatgpt)


### [Marketplace](https://marketplace.visualstudio.com/items?itemName=timkmecl.chatgpt)

<br>

<img src="examples/main.png" alt="Refactoring selected code using chatGPT"/>

## Update

Updated to use version 5.2.x [ChatGPT API](https://www.npmjs.com/package/chatgpt) Node.js library with support for GPT-4 using an API key instead of the old session key.

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
2. Go to Profile -> API key

Once you have obtained a API key, you can configure the extension to use it as described in the previous section.

### Run ChatGPT plugin

```
cd retrieval
pip install poetry
poetry env use python3.10
poetry shell
poetry install
```

Set your environment variables

```
export DATASTORE=pinecone
export BEARER_TOKEN=<your_database_interface_api_key>
export OPENAI_API_KEY=<your_openai_api_key>
export PINECONE_API_KEY=<your_pinecone_api_key>
export PINECONE_ENVIRONMENT=<your_pinecone_region_name>
export PINECONE_INDEX=<your_index_name>
```

### Run Database Interface Server
When The config is ready. Under the project directory, run:

`poetry run start`

It will start your Database Interface server. Open your browser and open `http://0.0.0.0:8000/docs#/`. 

If the page is up, you have successfully implemented the Database Interface module with Retrieval Plugin.

## Using Vector Database to store code base

The goal is to use an architecture similar to [chatgpt with external memory using vector database](https://betterprogramming.pub/enhancing-chatgpt-with-infinite-external-memory-using-vector-database-and-chatgpt-retrieval-plugin-b6f4ea16ab8)

[![Vector DB architecture](/resources/VectorDB-architecture.webp)

This will additionally use LangChain to chunk code files using a [Code splitter](https://python.langchain.com/en/latest/modules/indexes/text_splitters/examples/code_splitter.html) specific to the language of the code file being processed.

We will need an agent running in OS in the background to monitor file changes which upserts and deletes vectors in the DB based on OS file operations. 

It should only take into account files that are "source files" of the project. To achieve this, we can use `.gitignore` or `.npmignore` files foralong with a custom configuration.


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

For any `add` or `change` we call the `upsert` API of the FastAPI python API for [GPT Retrieval Plugin](https://github.com/openai/chatgpt-retrieval-plugin.git).

For `unlink` we call the `delete` endpoint.

We will however use [ignoring-watcher](https://www.npmjs.com/package/ignoring-watcher) as a convenient wrapper of Chokidar :)

The `file_agent.js` can be found in `src` and can be run simply via node:

`node src/file_agent.js`

or via script:

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


The retrieval plugin should be made to use a CodeSplitter for text files and other specific chunk splitters for other files (markdown, text etc) using LangChain.

A placeholder file `services/code_chunks` is there to work from.

Currently the file agent sends a special `language` metadata field as part of the `upsert` API call which can be used for chunking code files using an appropriate splitter.

`upsert` calls `get_document_chunks`, which calls `create_document_chunks` which calls `get_text_chunks`

`create_document_chunks` gets a document of the type `Document`

```py
class Document(BaseModel):
    id: Optional[str] = None
    text: str
    metadata: Optional[DocumentMetadata] = None
```

Based on the metadata for the document it should decide which chunker (splitter) to use.

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
