# ChatGPT for VSCode

This Visual Studio Code extension allows you to use the [unofficial ChatGPT API](https://github.com/transitive-bullshit/chatgpt-api) to generate natural language responses from OpenAI's [ChatGPT](https://chat.openai.com/chat) to your questions, right within the editor.

## Features
- Ask general questions or use code snippets from the editor to query ChatGPT
- View its responses in a panel next to the editor
- Insert code snippets from the AI's response into the active editor

## Getting started

To use this extension, you will need to authenticate with a valid session token from ChatGPT. To get a session token:

1. Go to https://chat.openai.com/chat and log in or sign up.
2. Open the developer tools in your browser.
3. Go to the `Application` tab and open the `Cookies` section.
4. Copy the value for `__Secure-next-auth.session-token` and save it.

Once you have obtained a session token, you can configure the extension to use it by adding the following line to your Visual Studio Code settings:

```
"chatgpt.SESSION_TOKEN": "<your session token here>"
```

Extensions should then be restarted in order to work.


## Using the Extension


To use the extension, open a text editor in Visual Studio Code and open the ChatGPT panel by clicking on the ChatGPT icon in the sidebar. This will open a panel with an input field where you can enter your prompt or question. By clicking enter, it will be sent to ChatGPT. Its response will be displayed below the input field in the sidebar (note that it may take some time for it to be calculated).

You can also select a code snippet in the editor and then enter a prompt in the side panel. The selected code will be automatically appended to your query when it is sent to the AI. This can be useful for generating code snippets or getting explanations for specific pieces of code.

To insert a code snippet from the AI's response into the editor, simply click on the code block in the panel. The code will be automatically inserted at the cursor position in the active editor.


## Current Issues

After installing the dependencies, you may need to modify the `exports` property of `node_modules\chatgpt\package.json` by moving the `default` property to be the last one in the object (`"exports": { "import": "./build/index.js", "types": "./build/index.d.ts", "default": "./build/index.js" },`)

Please note that this extension is currently a proof of concept and may have some limitations or bugs. We welcome feedback and contributions to improve the extension.

---

The extension makes use of this [ChatGPT package](https://github.com/transitive-bullshit/chatgpt-api), which uses ChatGPT unofficial API in order to login and communicate with ChatGPT.