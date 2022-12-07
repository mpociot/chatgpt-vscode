import * as vscode from 'vscode';
import { ChatGPTAPI } from 'chatgpt';




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Get the extension's configuration
	const config = vscode.workspace.getConfiguration('chatgpt');
	// Read the 'SESSION_TOKEN' value from the 'section1' section of the configuration
	const sessionToken = config.get('SESSION_TOKEN') as string|undefined;

	const provider = new ChatGPTViewProvider(context.extensionUri);
	provider.setSessionToken(sessionToken);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider));

	let disposable2 = vscode.commands.registerCommand('chatgpt.ask', () => {
		vscode.window.showInputBox({ prompt: 'What do you want to do?' }).then((value) => {
			provider.search(value);
		});
	});
	context.subscriptions.push(disposable2);



	// Change the extension's session token when configuration is changed
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		if (event.affectsConfiguration('chatgpt.SESSION_TOKEN')) {
				// Get the extension's configuration
				const config = vscode.workspace.getConfiguration('chatgpt');
				// Read the 'SESSION_TOKEN' value from the 'section1' section of the configuration
				const sessionToken = config.get('SESSION_TOKEN') as string|undefined;
				// add the new token to the provider
				provider.setSessionToken(sessionToken);
		}
});
}





class ChatGPTViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'chatgpt.chatView';

	private _view?: vscode.WebviewView;

	// This variable holds a reference to the ChatGPTAPI instance
	private _chatGPTAPI?: ChatGPTAPI;

	private _response?: string;

	private _sessionToken?: string;

	// In the constructor, we store the URI of the extension
	constructor(private readonly _extensionUri: vscode.Uri) {
		
	}
	
	// Set the session token and create a new API instance based on this token
	public setSessionToken(sessionToken?: string) {
		this._sessionToken = sessionToken;
		this._newAPI();
	}

	// This private method initializes a new ChatGPTAPI instance, using the session token if it is set
	private _newAPI() {
		if (!this._sessionToken) {
			console.warn("Session token not set");
		}else{
			this._chatGPTAPI = new ChatGPTAPI({
				sessionToken: this._sessionToken
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

		// when extension panel opens shows the previous response again
		webviewView.onDidChangeVisibility(e => {
			if (this._view && this._view.visible) {
				this._view.webview.postMessage({ type: 'addResponse', value: this._response });
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

		let response = '';

		// Check if the ChatGPTAPI instance is signed in
		let isSignedIn = false;
		try {
			this._chatGPTAPI && await this._chatGPTAPI.ensureAuth();
			isSignedIn = true;
		} catch (e) {
			console.error(e);
		}



		if (!isSignedIn || !this._chatGPTAPI) {
			response = '[ERROR] Please enter a valid API key in the extension settings';
		} else {
			// If successfully signed in
			if (this._view) {
				this._view.webview.postMessage({ type: 'addResponse', value: '...' });
			}

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

			console.log("sendMessage");
			// Send the search prompt to the ChatGPTAPI instance and store the response
			response = await this._chatGPTAPI.sendMessage(searchPrompt, {
				onProgress: (partialResponse) => {
					if (this._view && this._view.visible) {
						this._view.webview.postMessage({ type: 'addResponse', value: partialResponse });
					}
				}
			});
		}

		// Saves the response
		this._response = response;

		// console.log(response);

		// Show the view and send a message to the webview with the response
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ type: 'addResponse', value: response });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const microlightUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'microlight.min.js'));
		const tailwindUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'showdown.min.js'));
		const showdownUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'tailwind.min.js'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="${tailwindUri}"></script>
				<script src="${showdownUri}"></script>
				<script src="${microlightUri}"></script>
				<style>
				.code {
					white-space : pre;
				</style>
			</head>
			<body>
				<input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" type="text" id="prompt-input" />

				<div id="response" class="pt-6 text-sm">
				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}