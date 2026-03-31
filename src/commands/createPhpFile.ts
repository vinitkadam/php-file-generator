import * as vscode from 'vscode';
import { PhpFileType, PhpFileConfig } from '../types';
import { NamespaceResolver } from '../utils/namespaceResolver';
import { TemplateEngine } from '../utils/templateEngine';
import { FileHelper } from '../utils/fileHelper';

export class CreatePhpFileCommand {

    static async execute(uri: vscode.Uri | undefined, type: PhpFileType): Promise<void> {
        try {
            const targetDir = FileHelper.getTargetDirectory(uri);
            if (!targetDir) {
                vscode.window.showErrorMessage('No workspace folder is open.');
                return;
            }

            const className = await this.promptClassName(type);
            if (!className) {
                return;
            }

            const namespace = NamespaceResolver.resolve(targetDir);

            const config = vscode.workspace.getConfiguration('phpClassGenerator');
            const useStrictTypes = config.get<boolean>('useStrictTypes', true);

            const fileConfig: PhpFileConfig = {
                type,
                className,
                namespace,
                directory: targetDir,
                useStrictTypes,
            };

            const content = TemplateEngine.generate(fileConfig);
            const filePath = FileHelper.createFile(targetDir, className, content);
            await FileHelper.openFile(filePath);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    }

    private static async promptClassName(type: PhpFileType): Promise<string | undefined> {
        const typeName = type.replace('abstract ', '').replace('final ', '');
        const placeholder = `My${typeName.charAt(0).toUpperCase() + typeName.slice(1)}`;

        return vscode.window.showInputBox({
            title: `New PHP ${type}`,
            prompt: `Enter the ${type} name`,
            placeHolder: placeholder,
            validateInput: (value: string) => {
                return FileHelper.isValidClassName(value);
            }
        });
    }
}