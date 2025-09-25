import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';

const config = vscode.workspace.getConfiguration('pcPhpServer');

const serverPort = config.get<number>('port', 9000);
const projectRoot = config.get<string>('projectRoot', '/home/coder/project');

let phpTerminal: vscode.Terminal | null = null;

let statusBarItem: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Create status bar button
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'extension.togglePhpServer';

	updateStatusBar(); // Initial update
	statusBarItem.show();

	// Register toggle command
	const toggleCommand = vscode.commands.registerCommand('extension.togglePhpServer', togglePhpServer);

	// Start PHP server
	const startCommand = vscode.commands.registerCommand('extension.startPhpServer', togglePhpServer);

	// Stop PHP server
	const stopCommand = vscode.commands.registerCommand('extension.stopPhpServer', togglePhpServer);

	// Open file in browser
	const openInBrowserCommand = vscode.commands.registerCommand('extension.openInBrowser', openInBrowser);

	context.subscriptions.push(startCommand, stopCommand, openInBrowserCommand, toggleCommand);
}

function openInBrowser() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage("No active file to open.");
		return;
	}

	const filePath = editor.document.uri.fsPath;

	if (!filePath.startsWith(projectRoot)) {
		vscode.window.showErrorMessage(`File is outside the server root: ${projectRoot}`);
		return;
	}

	// Get relative path to the project root
	const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');
	const url = `http://localhost:${serverPort}/app${relativePath}`;

	vscode.env.openExternal(vscode.Uri.parse(url));
	vscode.window.showInformationMessage(`Opened: ${url}`);
}

function togglePhpServer() {
	if (phpTerminal) {
		stopPhpServer();
	} else {
		startPhpServer();
	}
	updateStatusBar();
}

function startPhpServer() {
	if (phpTerminal) {
		vscode.window.showInformationMessage('PHP server is already running.');
		return;
	}

	phpTerminal = vscode.window.createTerminal("PHP Server");
	phpTerminal.sendText(`php -S 0.0.0.0:${serverPort} -t ${projectRoot}`);
	phpTerminal.show();

	vscode.window.showInformationMessage(`Started PHP server at http://localhost:${serverPort}`);
}

function stopPhpServer() {
	if (phpTerminal) {
		phpTerminal.dispose();
		phpTerminal = null;
		vscode.window.showInformationMessage("Stopped PHP server.");
	} else {
		vscode.window.showInformationMessage("PHP server is not running.");
	}
}

function updateStatusBar() {
	if (phpTerminal) {
		statusBarItem.text = `$(primitive-square) Stop PHP Server`;
		statusBarItem.tooltip = "Click to stop the PHP server";
	} else {
		statusBarItem.text = `$(play) Start PHP Server`;
		statusBarItem.tooltip = "Click to start the PHP server";
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	stopPhpServer();
}
