"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const config = vscode.workspace.getConfiguration('pcPhpServer');
const serverPort = config.get('port', 9000);
const projectRoot = config.get('projectRoot', '/home/coder/project');
// const projectRoot = config.get<string>('projectRoot', '/Users/paolocantarella/prova');
let phpTerminal = null;
let statusBarItem;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Create status bar button
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'pcPhpServer.togglePhpServer';
    updateStatusBar(); // Initial update
    statusBarItem.show();
    // Register toggle command
    const toggleCommand = vscode.commands.registerCommand('pcPhpServer.togglePhpServer', togglePhpServer);
    // Start PHP server
    const startCommand = vscode.commands.registerCommand('pcPhpServer.startPhpServer', togglePhpServer);
    // Stop PHP server
    const stopCommand = vscode.commands.registerCommand('pcPhpServer.stopPhpServer', togglePhpServer);
    // Open file in browser
    const openInBrowserCommand = vscode.commands.registerCommand('pcPhpServer.openInBrowser', openInBrowser);
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
    const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');
    const baseLocalUri = vscode.Uri.parse(`http://localhost:${serverPort}`);
    vscode.env.asExternalUri(baseLocalUri).then((externalBaseUri) => {
        // Now you build the full external URL
        const externalUrl = vscode.Uri.joinPath(externalBaseUri, relativePath).toString();
        vscode.env.openExternal(vscode.Uri.parse(externalUrl));
        vscode.window.showInformationMessage(`Opened: ${externalUrl}`);
    }, (err) => {
        vscode.window.showErrorMessage(`Failed to resolve external URI: ${err.message}`);
    });
}
function togglePhpServer() {
    if (phpTerminal) {
        stopPhpServer();
    }
    else {
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
    }
    else {
        vscode.window.showInformationMessage("PHP server is not running.");
    }
}
function updateStatusBar() {
    if (phpTerminal) {
        statusBarItem.text = `$(primitive-square) Stop PHP Server`;
        statusBarItem.tooltip = "Click to stop the PHP server";
    }
    else {
        statusBarItem.text = `$(play) Start PHP Server`;
        statusBarItem.tooltip = "Click to start the PHP server";
    }
}
// This method is called when your extension is deactivated
function deactivate() {
    stopPhpServer();
}
//# sourceMappingURL=extension.js.map