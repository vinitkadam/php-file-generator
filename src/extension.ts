import * as vscode from 'vscode';
import { CreatePhpFileCommand } from './commands/createPhpFile';
import { PhpFileType } from './types';

export function activate(context: vscode.ExtensionContext) {

    console.log('PHP Class Generator is now active!');

    // Define all commands and their corresponding types
    const commands: { command: string; type: PhpFileType }[] = [
        { command: 'phpClassGenerator.newClass', type: 'class' },
        { command: 'phpClassGenerator.newAbstractClass', type: 'abstract class' },
        { command: 'phpClassGenerator.newFinalClass', type: 'final class' },
        { command: 'phpClassGenerator.newInterface', type: 'interface' },
        { command: 'phpClassGenerator.newTrait', type: 'trait' },
        { command: 'phpClassGenerator.newEnum', type: 'enum' },
    ];

    // Register each command
    for (const { command, type } of commands) {
        const disposable = vscode.commands.registerCommand(
            command,
            (uri: vscode.Uri) => CreatePhpFileCommand.execute(uri, type)
        );
        context.subscriptions.push(disposable);
    }

    // Register a combined "quick pick" command
    const quickPick = vscode.commands.registerCommand(
        'phpClassGenerator.newPhpFile',
        async (uri: vscode.Uri) => {
            const typeOptions: { label: string; description: string; type: PhpFileType }[] = [
                {
                    label: '$(symbol-class) Class',
                    description: 'Create a new PHP class',
                    type: 'class'
                },
                {
                    label: '$(symbol-class) Abstract Class',
                    description: 'Create a new abstract class',
                    type: 'abstract class'
                },
                {
                    label: '$(symbol-class) Final Class',
                    description: 'Create a new final class',
                    type: 'final class'
                },
                {
                    label: '$(symbol-interface) Interface',
                    description: 'Create a new interface',
                    type: 'interface'
                },
                {
                    label: '$(symbol-misc) Trait',
                    description: 'Create a new trait',
                    type: 'trait'
                },
                {
                    label: '$(symbol-enum) Enum',
                    description: 'Create a new enum (PHP 8.1+)',
                    type: 'enum'
                },
            ];

            const selected = await vscode.window.showQuickPick(typeOptions, {
                title: 'New PHP File',
                placeHolder: 'Select the type of PHP file to create',
            });

            if (selected) {
                await CreatePhpFileCommand.execute(uri, selected.type);
            }
        }
    );

    context.subscriptions.push(quickPick);
}

export function deactivate() {}