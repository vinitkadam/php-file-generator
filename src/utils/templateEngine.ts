import { PhpFileConfig } from '../types';

export class TemplateEngine {

    static generate(config: PhpFileConfig): string {
        const lines: string[] = [];

        lines.push('<?php');
        lines.push('');

        if (config.useStrictTypes) {
            lines.push('declare(strict_types=1);');
            lines.push('');
        }

        if (config.namespace) {
            lines.push(`namespace ${config.namespace};`);
            lines.push('');
        }

        lines.push(`${config.type} ${config.className}`);
        lines.push('{');
        lines.push('    //');
        lines.push('}');
        lines.push('');

        return lines.join('\n');
    }
}