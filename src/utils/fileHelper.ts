import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class FileHelper {

    /**
     * Resolves the target directory from a URI or falls back to workspace root
     */
    static getTargetDirectory(uri?: vscode.Uri): string | null {
        if (uri) {
            try {
                const stat = fs.statSync(uri.fsPath);
                return stat.isDirectory() ? uri.fsPath : path.dirname(uri.fsPath);
            } catch {
                return path.dirname(uri.fsPath);
            }
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        return workspaceFolders[0].uri.fsPath;
    }

    /**
     * Creates a PHP file and returns the file path
     */
    static createFile(directory: string, fileName: string, content: string): string {
        const filePath = path.join(directory, `${fileName}.php`);

        if (fs.existsSync(filePath)) {
            throw new Error(`File "${fileName}.php" already exists in this directory.`);
        }

        // Ensure directory exists
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf8');
        return filePath;
    }

    /**
     * Opens a file in the editor and positions cursor
     */
    static async openFile(filePath: string): Promise<vscode.TextEditor> {
        const document = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(document);

        // Find the cursor position (first // comment or empty line inside braces)
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '//' || lines[i].trim() === '') {
                // Check if we're inside the class body
                const prevLines = lines.slice(0, i).join('\n');
                if (prevLines.includes('{')) {
                    const position = new vscode.Position(i, lines[i].indexOf('//') >= 0 ? lines[i].indexOf('//') : 4);

                    // Select the // comment for easy replacement
                    if (lines[i].trim() === '//') {
                        const startCol = lines[i].indexOf('//');
                        const selection = new vscode.Selection(
                            new vscode.Position(i, startCol),
                            new vscode.Position(i, startCol + 2)
                        );
                        editor.selection = selection;
                    } else {
                        editor.selection = new vscode.Selection(position, position);
                    }
                    break;
                }
            }
        }

        return editor;
    }

    /**
     * Validates a PHP class name
     */
    static isValidClassName(name: string): string | null {
        if (!name || name.trim().length === 0) {
            return 'Name cannot be empty';
        }

        if (!/^[A-Z][a-zA-Z0-9_]*$/.test(name.trim())) {
            return 'Name must start with an uppercase letter and contain only letters, numbers, and underscores';
        }

        // Check for PHP reserved words
        const reserved = [
            'abstract', 'and', 'array', 'as', 'break', 'callable', 'case',
            'catch', 'class', 'clone', 'const', 'continue', 'declare',
            'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty',
            'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch',
            'endwhile', 'eval', 'exit', 'extends', 'final', 'finally',
            'fn', 'for', 'foreach', 'function', 'global', 'goto', 'if',
            'implements', 'include', 'include_once', 'instanceof', 'insteadof',
            'interface', 'isset', 'list', 'match', 'namespace', 'new', 'or',
            'print', 'private', 'protected', 'public', 'readonly', 'require',
            'require_once', 'return', 'static', 'switch', 'throw', 'trait',
            'try', 'unset', 'use', 'var', 'while', 'xor', 'yield'
        ];

        if (reserved.includes(name.toLowerCase())) {
            return `"${name}" is a PHP reserved word`;
        }

        return null;
    }
}