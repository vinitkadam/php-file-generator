import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ComposerJson, ComposerAutoload } from '../types';

export class NamespaceResolver {

    /**
     * Detects the PHP namespace for a given directory based on composer.json PSR-4 mapping
     */
    static resolve(targetDir: string): string {
        const workspaceRoot = this.getWorkspaceRoot();
        if (!workspaceRoot) {
            return '';
        }

        // Try composer.json first
        const composerNamespace = this.resolveFromComposer(workspaceRoot, targetDir);
        if (composerNamespace !== null) {
            return composerNamespace;
        }

        // Fallback: derive from directory path
        return this.resolveFromPath(workspaceRoot, targetDir);
    }

    /**
     * Reads composer.json and resolves namespace from PSR-4 autoload mapping
     */
    private static resolveFromComposer(rootPath: string, targetDir: string): string | null {
        const composerPath = path.join(rootPath, 'composer.json');

        if (!fs.existsSync(composerPath)) {
            return null;
        }

        try {
            const composerContent = fs.readFileSync(composerPath, 'utf8');
            const composer: ComposerJson = JSON.parse(composerContent);

            // Merge autoload and autoload-dev PSR-4 entries
            const psr4Mappings: ComposerAutoload = {
                ...(composer.autoload?.['psr-4'] || {}),
                ...(composer['autoload-dev']?.['psr-4'] || {})
            };

            // Sort by directory path length (longest first) for most specific match
            const sortedEntries = Object.entries(psr4Mappings).sort((a, b) => {
                const aDir = Array.isArray(a[1]) ? a[1][0] : a[1];
                const bDir = Array.isArray(b[1]) ? b[1][0] : b[1];
                return (bDir as string).length - (aDir as string).length;
            });

            for (const [namespace, directories] of sortedEntries) {
                const dirs = Array.isArray(directories) ? directories : [directories];

                for (const dir of dirs) {
                    const absoluteAutoloadDir = path.resolve(rootPath, dir);
                    const normalizedTarget = path.resolve(targetDir);

                    if (normalizedTarget.startsWith(absoluteAutoloadDir)) {
                        const relativePath = path.relative(absoluteAutoloadDir, normalizedTarget);
                        const namespaceSuffix = relativePath
                            .split(path.sep)
                            .filter(Boolean)
                            .join('\\');

                        const baseNamespace = namespace.replace(/\\$/, '');

                        return namespaceSuffix
                            ? `${baseNamespace}\\${namespaceSuffix}`
                            : baseNamespace;
                    }
                }
            }
        } catch (error) {
            console.error('Error reading composer.json:', error);
        }

        return null;
    }

    /**
     * Fallback: Resolve namespace from directory path relative to common source directories
     */
    private static resolveFromPath(rootPath: string, targetDir: string): string {
        const relativePath = path.relative(rootPath, targetDir);

        // Common source directories and their namespace prefixes
        const sourceDirectories: { [key: string]: string } = {
            'src': 'App',
            'app': 'App',
            'lib': 'Lib',
            'tests': 'Tests',
            'test': 'Tests',
        };

        const parts = relativePath.split(path.sep).filter(Boolean);

        if (parts.length > 0 && sourceDirectories[parts[0]]) {
            parts[0] = sourceDirectories[parts[0]];
        }

        return parts.join('\\');
    }

    /**
     * Gets the workspace root path
     */
    private static getWorkspaceRoot(): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        return workspaceFolders[0].uri.fsPath;
    }

    /**
     * Gets all available namespaces from composer.json (for autocomplete)
     */
    static getAvailableNamespaces(): string[] {
        const workspaceRoot = this.getWorkspaceRoot();
        if (!workspaceRoot) {
            return [];
        }

        const composerPath = path.join(workspaceRoot, 'composer.json');
        if (!fs.existsSync(composerPath)) {
            return [];
        }

        try {
            const composer: ComposerJson = JSON.parse(
                fs.readFileSync(composerPath, 'utf8')
            );

            const namespaces: string[] = [];

            const psr4 = {
                ...(composer.autoload?.['psr-4'] || {}),
                ...(composer['autoload-dev']?.['psr-4'] || {})
            };

            for (const ns of Object.keys(psr4)) {
                namespaces.push(ns.replace(/\\$/, ''));
            }

            return namespaces;
        } catch {
            return [];
        }
    }
}