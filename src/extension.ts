import * as vscode from 'vscode';
import { ChatGPTAPI } from 'chatgpt';


export function activate(context: vscode.ExtensionContext) {
	// Get the API session token from the extension's configuration
	const config = vscode.workspace.getConfiguration('chatgpt');
	const sessionToken = config.get('sessionToken') as string|undefined;

	// Create a new ChatGPTViewProvider instance and register it with the extension's context
	const provider = new ChatGPTViewProvider(context.extensionUri);
	provider.setSessionToken(sessionToken);
	provider.selectedInsideCodeblock = config.get('selectedInsideCodeblock') || false;
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider,  {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);


	const commandHandler = (command:string) => {
		const config = vscode.workspace.getConfiguration('chatgpt');
		const prompt = config.get(command) as string;
		provider.search(prompt, true);
	};

	const commandAsk = vscode.commands.registerCommand('chatgpt.ask', () => {
		vscode.window.showInputBox({ prompt: 'What do you want to do?' }).then((value) => {
			provider.search(value);
		});
	});
	const commandExplain = vscode.commands.registerCommand('chatgpt.explain', () => {	
		commandHandler('promptPrefix.explain');
	});
	const commandRefactor = vscode.commands.registerCommand('chatgpt.refactor', () => {
		commandHandler('promptPrefix.refactor');
	});
	const commandOptimize = vscode.commands.registerCommand('chatgpt.optimize', () => {
		commandHandler('promptPrefix.optimize');
	});
	const commandProblems = vscode.commands.registerCommand('chatgpt.findProblems', () => {
		commandHandler('promptPrefix.findProblems');
	});
	

	context.subscriptions.push(commandAsk, commandExplain, commandRefactor, commandOptimize, commandProblems);



	// Change the extension's session token when configuration is changed
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		if (event.affectsConfiguration('chatgpt.sessionToken')) {
				// Get the extension's configuration
				const config = vscode.workspace.getConfiguration('chatgpt');
				const sessionToken = config.get('sessionToken') as string|undefined;
				// add the new token to the provider
				provider.setSessionToken(sessionToken);
		} else if (event.affectsConfiguration('chatgpt.selectedInsideCodeblock')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.selectedInsideCodeblock = config.get('selectedInsideCodeblock') || false;
		} else if (event.affectsConfiguration('chatgpt.pasteOnClick')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.pasteOnClick = config.get('pasteOnClick') || false;
		}
});
}





class ChatGPTViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'chatgpt.chatView';

	private _view?: vscode.WebviewView;

	// This variable holds a reference to the ChatGPTAPI instance
	private _chatGPTAPI?: ChatGPTAPI;

	private _response?: string;
	private _prompt?: string;


	public selectedInsideCodeblock = false;
	public pasteOnClick = true;
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
						// do nothing if the pasteOnClick option is disabled
						if (!this.pasteOnClick) {
							break;
						}

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



	public async search(prompt:string|undefined, fromCommand:boolean = false) {
		this._prompt = prompt;
		if (!prompt) {
			prompt = '';
		};

		// Check if the ChatGPTAPI instance is defined
		if (!this._chatGPTAPI) {
			this._newAPI();
		}

		// focus gpt activity from activity bar
		if (!this._view) {
			await vscode.commands.executeCommand('chatgpt.chatView.focus');
		} else {
				this._view?.show?.(true);
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
				if (this.selectedInsideCodeblock) {
					searchPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;
				} else {
					searchPrompt = `${prompt}\n${selectedText}\n`;
				}
			} else {
				// Otherwise, just use the prompt if user typed it
				searchPrompt = prompt;
			}

			console.log("sendMessage");

			// Make sure the prompt is shown
			this._view?.webview.postMessage({ type: 'setPrompt', value: this._prompt });

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