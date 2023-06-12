import * as vscode from 'vscode';
import { ChatGPTViewProvider } from './view-provider';

export function activate(context: vscode.ExtensionContext) {
	// Get the API key  from the extension's configuration
	const config = vscode.workspace.getConfiguration('chatgpt');	
	const apiKey = config.get('apiKey') as string|undefined;
	const model = config.get('model') as string|undefined;
	const temperature = config.get('temperature') as string|undefined;
	const topP = config.get('topP') as string|undefined;

	// Create a new ChatGPTViewProvider instance and register it with the extension's context
	const provider = new ChatGPTViewProvider(context.extensionUri);
	provider.setApiKey(apiKey);
	provider.setModel(model);
	provider.setTemperature(temperature);
	provider.setTopP(topP);

	// Put configuration settings into the provider
	provider.selectedInsideCodeblock = config.get('selectedInsideCodeblock') || false;
	provider.pasteOnClick = config.get('pasteOnClick') || false;
	provider.keepConversation = config.get('keepConversation') || false;
	provider.timeoutLength = config.get('timeoutLength') || 60;

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider,  {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);

	// Register the commands that can be called from the extension's package.json
	const commandHandler = (command:string) => {
		const config = vscode.workspace.getConfiguration('chatgpt');
		const prompt = config.get(command) as string;
		provider.search(prompt);
	};

	const commandAsk = vscode.commands.registerCommand('chatgpt.ask', () => {
		vscode.window.showInputBox({ prompt: 'What do you want to do?' }).then((value) => {
			provider.search(value);
		});
	});
	const commandConversationId = vscode.commands.registerCommand('chatgpt.conversationId', () => {
		vscode.window.showInputBox({ 
			prompt: 'Set Conversation ID or delete it to reset the conversation',
			placeHolder: 'conversationId (leave empty to reset)',
			value: provider.getConversationId()
		}).then((conversationId: string | undefined) => {
			if (!conversationId) {
				provider.resetConversationId();
			}
			if (conversationId) {
				vscode.window.showInputBox({ 
					prompt: 'Set Parent Message ID',
					placeHolder: 'messageId (leave empty to reset)',
					value: provider.getParentMessageId()
				}).then((messageId) => {
					provider.setConversationId({conversationId: messageId});
				});
			}
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

	let commandResetConversation = vscode.commands.registerCommand('chatgpt.resetConversation', () => {
		provider.resetConversationId();
	});
	

	context.subscriptions.push(commandAsk, commandConversationId, commandExplain, commandRefactor, commandOptimize, commandProblems, commandResetConversation);

	// Change the extension's API key when configuration is changed
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		if (event.affectsConfiguration('chatgpt.apiKey')) {
			// Get the extension's configuration
			const config = vscode.workspace.getConfiguration('chatgpt');
			const apiKey = config.get('apiKey') as string|undefined;
			// add the new token to the provider
			provider.setApiKey(apiKey);

		} else if (event.affectsConfiguration('chatgpt.selectedInsideCodeblock')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.selectedInsideCodeblock = config.get('selectedInsideCodeblock') || false;

		} else if (event.affectsConfiguration('chatgpt.pasteOnClick')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.pasteOnClick = config.get('pasteOnClick') || false;

		} else if (event.affectsConfiguration('chatgpt.keepConversation')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.keepConversation = config.get('keepConversation') || false;

		}else if (event.affectsConfiguration('chatgpt.timeoutLength')) {
			const config = vscode.workspace.getConfiguration('chatgpt');
			provider.timeoutLength = config.get('timeoutLength') || 60;
		}
});
}



// This method is called when your extension is deactivated
export function deactivate() {}