import * as vscode from 'vscode';
import { PhpFileType, PhpFileConfig } from '../types';
import { NamespaceResolver } from '../utils/namespaceResolver';
import { TemplateEngine } from '../utils/templateEngine';
import { FileHelper } from '../utils/fileHelper';

export class CreatePhpFileCommand {

    /**
     * Main handler for creating a new PHP file
     */
    static async execute(uri: vscode.Uri | undefined, type: PhpFileType): Promise<void> {
        try {
            // Step 1: Determine target directory
            const targetDir = FileHelper.getTargetDirectory(uri);
            if (!targetDir) {
                vscode.window.showErrorMessage('No workspace folder is open.');
                return;
            }

            // Step 2: Get class name from user
            const className = await this.promptClassName(type);
            if (!className) {
                return; // User cancelled
            }

            // Step 3: Auto-detect namespace
            const detectedNamespace = NamespaceResolver.resolve(targetDir);
            const namespace = await this.promptNamespace(detectedNamespace);
            if (namespace === undefined) {
                return; // User cancelled
            }

            // Step 4: Get extends/implements (for applicable types)
            const { extendsClass, implementsInterfaces } = await this.promptInheritance(type);

            // Step 5: Get additional options
            const options = await this.promptOptions(type);
            if (options === null) {
                return; // User cancelled
            }

            // Step 6: Get extension settings
            const config = vscode.workspace.getConfiguration('phpClassGenerator');
            const useStrictTypes = config.get<boolean>('useStrictTypes', true);

            // Step 7: Build configuration
            const fileConfig: PhpFileConfig = {
                type,
                className,
                namespace,
                directory: targetDir,
                extendsClass: extendsClass || undefined,
                implementsInterfaces:
                    implementsInterfaces.length > 0 ? implementsInterfaces : undefined,
                isReadonly: options.isReadonly,
                enumBackingType: options.enumBackingType,
                useStrictTypes,
            };

            // Step 8: Generate content
            const content = TemplateEngine.generate(fileConfig);

            // Step 9: Create file
            const filePath = FileHelper.createFile(targetDir, className, content);

            // Step 10: Open file in editor
            await FileHelper.openFile(filePath);

            // Step 11: Show success message
            vscode.window.showInformationMessage(
                `✅ ${type} "${className}" created successfully!`
            );

        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    }

    /**
     * Prompts user for the class/interface/trait/enum name
     */
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

    /**
     * Prompts user to confirm or edit the auto-detected namespace
     */
    private static async promptNamespace(
        detectedNamespace: string
    ): Promise<string | undefined> {
        return vscode.window.showInputBox({
            title: 'Namespace',
            prompt: 'Confirm or edit the namespace',
            value: detectedNamespace,
            placeHolder: 'App\\Models',
        });
    }

    /**
     * Prompts user for extends and implements
     */
    private static async promptInheritance(type: PhpFileType): Promise<{
        extendsClass: string;
        implementsInterfaces: string[];
    }> {
        let extendsClass = '';
        let implementsInterfaces: string[] = [];

        // Extends (for class, abstract class, final class, interface)
        if (['class', 'abstract class', 'final class', 'interface'].includes(type)) {
            const extendsLabel = type === 'interface' ? 'Extends interface' : 'Extends class';
            extendsClass = (await vscode.window.showInputBox({
                title: extendsLabel,
                prompt: `${extendsLabel} (leave empty to skip)`,
                placeHolder: type === 'interface' ? 'ParentInterface' : 'BaseClass',
            })) || '';
        }

        // Implements (for class types only)
        if (['class', 'abstract class', 'final class'].includes(type)) {
            const implementsInput = (await vscode.window.showInputBox({
                title: 'Implements',
                prompt: 'Implements interfaces, comma-separated (leave empty to skip)',
                placeHolder: 'Countable, Serializable',
            })) || '';

            if (implementsInput) {
                implementsInterfaces = implementsInput
                    .split(',')
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
            }
        }

        return { extendsClass, implementsInterfaces };
    }

    /**
     * Prompts for additional type-specific options
     */
    private static async promptOptions(type: PhpFileType): Promise<{
        isReadonly: boolean;
        enumBackingType: 'string' | 'int' | null;
    } | null> {
        let isReadonly = false;
        let enumBackingType: 'string' | 'int' | null = null;

        // Readonly option for classes
        if (['class', 'final class'].includes(type)) {
            const readonlyOption = await vscode.window.showQuickPick(
                ['No', 'Yes'],
                {
                    title: 'Readonly class?',
                    placeHolder: 'Make this a readonly class? (PHP 8.2+)'
                }
            );

            if (readonlyOption === undefined) {
                return null;
            }

            isReadonly = readonlyOption === 'Yes';
        }

        // Enum backing type
        if (type === 'enum') {
            const backingType = await vscode.window.showQuickPick(
                [
                    { label: 'None (Unit Enum)', value: null },
                    { label: 'string', value: 'string' as const },
                    { label: 'int', value: 'int' as const },
                ],
                {
                    title: 'Enum Backing Type',
                    placeHolder: 'Select the backing type for this enum'
                }
            );

            if (backingType === undefined) {
                return null;
            }

            enumBackingType = backingType.value;
        }

        return { isReadonly, enumBackingType };
    }
}