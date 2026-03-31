import { PhpFileConfig } from '../types';

export class TemplateEngine {

    /**
     * Generates complete PHP file content based on configuration
     */
    static generate(config: PhpFileConfig): string {
        const lines: string[] = [];

        // Opening tag
        lines.push('<?php');
        lines.push('');

        // Strict types declaration
        if (config.useStrictTypes) {
            lines.push('declare(strict_types=1);');
            lines.push('');
        }

        // Namespace
        if (config.namespace) {
            lines.push(`namespace ${config.namespace};`);
            lines.push('');
        }

        // Use statements placeholder (empty line for future imports)
        // Will be populated if extends/implements are fully qualified

        // Build the type declaration
        const declaration = this.buildDeclaration(config);
        lines.push(declaration);
        lines.push('{');

        // Add body content based on type
        const body = this.buildBody(config);
        if (body) {
            lines.push(body);
        }

        lines.push('}');
        lines.push('');

        return lines.join('\n');
    }

    /**
     * Builds the class/interface/trait/enum declaration line
     */
    private static buildDeclaration(config: PhpFileConfig): string {
        const parts: string[] = [];

        // Type keyword
        switch (config.type) {
            case 'abstract class':
                parts.push('abstract class');
                break;
            case 'final class':
                if (config.isReadonly) {
                    parts.push('final readonly class');
                } else {
                    parts.push('final class');
                }
                break;
            case 'class':
                if (config.isReadonly) {
                    parts.push('readonly class');
                } else {
                    parts.push('class');
                }
                break;
            case 'interface':
                parts.push('interface');
                break;
            case 'trait':
                parts.push('trait');
                break;
            case 'enum':
                parts.push('enum');
                break;
        }

        // Class name
        parts.push(config.className);

        // Enum backing type
        if (config.type === 'enum' && config.enumBackingType) {
            parts.push(`: ${config.enumBackingType}`);
        }

        // Build the declaration string
        let declaration = parts.join(' ');

        // Extends
        if (config.extendsClass) {
            declaration += ` extends ${config.extendsClass}`;
        }

        // Implements
        if (config.implementsInterfaces && config.implementsInterfaces.length > 0) {
            declaration += ` implements ${config.implementsInterfaces.join(', ')}`;
        }

        return declaration;
    }

    /**
     * Builds the body content for the PHP type
     */
    private static buildBody(config: PhpFileConfig): string {
        switch (config.type) {
            case 'class':
            case 'abstract class':
            case 'final class':
                return this.buildClassBody(config);
            case 'interface':
                return this.buildInterfaceBody();
            case 'trait':
                return this.buildTraitBody();
            case 'enum':
                return this.buildEnumBody(config);
            default:
                return '';
        }
    }

    private static buildClassBody(config: PhpFileConfig): string {
        const lines: string[] = [];
        lines.push('    public function __construct()');
        lines.push('    {');
        lines.push('        //');
        lines.push('    }');
        return lines.join('\n');
    }

    private static buildInterfaceBody(): string {
        return '    //';
    }

    private static buildTraitBody(): string {
        return '    //';
    }

    private static buildEnumBody(config: PhpFileConfig): string {
        if (config.enumBackingType === 'string') {
            return "    case Example = 'example';";
        } else if (config.enumBackingType === 'int') {
            return '    case Example = 1;';
        }
        return '    case Example;';
    }
}