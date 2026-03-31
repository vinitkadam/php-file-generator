# PHP Class Generator

PHPStorm-like PHP file generator for VS Code. Create classes, abstract classes, final classes, interfaces, traits, and enums with auto-detected namespaces from `composer.json` PSR-4 mappings.

## Features

- Generate PHP classes, abstract classes, final classes, interfaces, traits, and enums
- Auto-detect namespace from `composer.json` PSR-4 autoload mappings
- Fallback namespace resolution from directory structure (`src/` → `App\`, `tests/` → `Tests\`)
- Single prompt — just type the name, everything else is handled automatically
- Right-click context menu in the explorer
- Keyboard shortcut: `Ctrl+Alt+P` / `Cmd+Alt+P`

## Installation

### Download and install `.vsix`

1. Download the `.vsix` from [Releases](http://tree.mn/vinit.ka/php-class-generator/-/releases).
2. Open VS Code.
3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
4. Run **Extensions: Install from VSIX...**.
5. Select the downloaded `.vsix` file.

## Usage

1. Right-click a folder in the explorer → **New PHP...**
2. Select the type (class, interface, trait, enum, etc.)
3. Type the name
4. Done — the file is created and opened with the correct namespace

Or use the command palette (`Ctrl+Shift+P`) and search for **PHP: New PHP File...**.

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `phpClassGenerator.useStrictTypes` | `true` | Add `declare(strict_types=1)` to generated files |

## Release Notes

### 1.0.0

Initial release.
