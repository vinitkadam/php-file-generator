export type PhpFileType =
    | 'class'
    | 'abstract class'
    | 'final class'
    | 'interface'
    | 'trait'
    | 'enum';

export interface PhpFileConfig {
    type: PhpFileType;
    className: string;
    namespace: string;
    directory: string;
    useStrictTypes?: boolean;
}

export interface ComposerAutoload {
    [namespace: string]: string | string[];
}

export interface ComposerJson {
    autoload?: {
        'psr-4'?: ComposerAutoload;
    };
    'autoload-dev'?: {
        'psr-4'?: ComposerAutoload;
    };
}