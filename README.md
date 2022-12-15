# ChatGPT for VSCode

This is a VSCode extension that allows you to use ChatGPT right within VSCode.

**Warning:** Right now, this is more of a proof of concept!

## How it works

The extension makes use of this [ChatGPT package](https://github.com/transitive-bullshit/chatgpt-api), which uses Playwright/a headless chrome in order to login and communicate with ChatGPT.

In order to use this with VSCode, it's best to run the extension in debug mode once.
On the initial start, you will need to authenticate with OpenAI - this requires you to login via the headless Chrome.

When you are successfully authenticated, you can turn on headless mode so that the browser won't be visible.
