import * as vscode from 'vscode';
import { ChatGPTAPI } from 'chatgpt';



// Get the extension's configuration
let config = vscode.workspace.getConfiguration('chatgpt');
// Read the 'SESSION_TOKEN' value from the 'section1' section of the configuration
let SESSION_TOKEN:string|undefined = config.get('SESSION_TOKEN');



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const provider = new ChatGPTViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider));

	let disposable2 = vscode.commands.registerCommand('chatgpt.ask', () => {
		vscode.window.showInputBox({ prompt: 'What do you want to do?' }).then((value) => {
			provider.search(value);
		});
	});
	context.subscriptions.push(disposable2);

}



class ChatGPTViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'chatgpt.chatView';

	private _view?: vscode.WebviewView;

	// This variable holds a reference to the ChatGPTAPI instance
	private _chatGPTAPI: ChatGPTAPI | undefined;

	// In the constructor, we store the URI of the extension and initialize a new ChatGPTAPI instance
	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
		this._newAPI();
	}

	// This private method initializes a new ChatGPTAPI instance, using the session token if it is set
	private _newAPI() {
		if (!SESSION_TOKEN) {
			console.warn("Session token not set");
		}else{
			this._chatGPTAPI = new ChatGPTAPI({
				sessionToken: SESSION_TOKEN
			});
		}
	}


	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

			// set options for the webview
			webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		// set the HTML for the webview
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// add an event listener for messages received by the webview
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'codeSelected':
					{
						let code = data.value;
						code = code.replace(/([^\\])(\$)([^{0-9])/g, "$1\\$$$3");

						// insert the code as a snippet into the active text editor
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(code));
						break;
					}
				case 'prompt':
					{
						this.search(data.value);
					}
			}
		});
	}

	public async search(prompt:string|undefined) {
		if (!prompt) {
			prompt = '';
		};

		// Check if the ChatGPTAPI instance is defined
		if (!this._chatGPTAPI) {
			this._newAPI();
		}

		// Check if the ChatGPTAPI instance is signed in
		const isSignedIn = this._chatGPTAPI && await this._chatGPTAPI.ensureAuth();

		let response = '';
		if (!isSignedIn || !this._chatGPTAPI) {
			response = 'Please enter a valid API key in the extension settings';
		} else {
			// Get the selected text of the active editor
			const selection = vscode.window.activeTextEditor?.selection;
			const selectedText = vscode.window.activeTextEditor?.document.getText(selection);
			let searchPrompt = '';

			if (selection && selectedText) {
				// If there is a selection, add the prompt and the selected text to the search prompt
				searchPrompt = `${prompt}\n${selectedText}\n`;
				
			} else {
				// Otherwise, just use the prompt
				searchPrompt = prompt;
			}

			// Send the search prompt to the ChatGPTAPI instance and store the response
			response = await this._chatGPTAPI.sendMessage(searchPrompt);
		}

		// Show the view and send a message to the webview with the response
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ type: 'addResponse', value: response });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="  https://unpkg.com/showdown/dist/showdown.min.js"></script>
				<script src="https://cdn.tailwindcss.com"></script>
			</head>
			<body>
				<input class="h-10 w-full text-white bg-stone-700 p-4 text-md font-mono" type="text" id="prompt-input" />

				<div id="response" class="pt-4 text-md">
				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}