import {
  resolve,
  relative,
  extname,
  normalize,
  isAbsolute,
  posix,
  sep,
} from 'path';
import { safeRequire, safelyGet } from '@midwayjs/core';
import { run } from '@midwayjs/glob';
import { writeFileSync, existsSync } from 'fs';
import * as ts from 'typescript';
import * as os from 'os';

function formatWindowsPath(p: string) {
  if (os.platform() === 'win32' && p) {
    return p.split(sep).join(posix.sep);
  }
  return p;
}

interface EntryGeneratorOptions {
  baseUrl?: string;
  rootDir?: string;
  ignore?: string[];
  pattern?: string[];
}
interface ExportCollection {
  configurationFilepath?: string;
  configurationClz?: string;
  exportFiles?: string[];
}

const defaultEntryGeneratorOptions: EntryGeneratorOptions = {
  baseUrl: process.cwd(),
  rootDir: 'src',
};

export const isWithin = function (parent: string, child: string) {
  parent = normalize(parent);
  child = normalize(child);
  const r = relative(parent, child);
  return !isAbsolute(r) && !r.startsWith('..');
};

export class EntryGenerator {
  private typeChecker!: ts.TypeChecker;
  private program!: ts.Program;
  private sourceDir!: string;
  private programFiles!: string[];

  DEFAULT_PATTERN = ['**/**.ts', '**/**.tsx', '**/**.js'];
  DEFAULT_IGNORE_PATTERN = [
    '**/**.d.ts',
    '**/logs/**',
    '**/run/**',
    '**/app/extend/**',
    '**/node_modules/**',
    '**/**.test.ts',
    '**/**.test.js',
    '**/__test__/**',
    '*/index.ts',
  ];

  BANNER = '/** This file generated by @midwayjs/bundle-helper */\n\r';

  constructor(options?: EntryGeneratorOptions) {
    this.preset(options);
  }

  // init
  private preset(options?: EntryGeneratorOptions) {
    options = Object.assign({}, defaultEntryGeneratorOptions, options);
    const baseUrl = options.baseUrl;

    const projectConfig = safeRequire(resolve(baseUrl, 'tsconfig'));
    const srcDir =
      safelyGet('compilerOptions.rootDir', projectConfig) ?? options.rootDir;

    if (!existsSync(resolve(baseUrl, 'tsconfig.json'))) {
      throw new Error(
        'Not found tsconfig.json bundle-helper only supports typescript'
      );
    }

    this.sourceDir = resolve(baseUrl, srcDir);
    this.programFiles = run(
      this.DEFAULT_PATTERN.concat(options.pattern || []),
      {
        cwd: this.sourceDir,
        ignore: this.DEFAULT_IGNORE_PATTERN.concat(options.ignore || []),
      }
    );

    this.program = ts.createProgram(this.programFiles, {
      target: ts.ScriptTarget.Latest,
      rootDir: this.sourceDir,
    });

    this.typeChecker = this.program.getTypeChecker();
  }

  private visit(node: ts.Node, collection: ExportCollection) {
    if (ts.isClassDeclaration(node)) {
      let decorators;
      if (node['decorators']) {
        decorators = node['decorators'];
      } else if (ts['canHaveDecorators']) {
        decorators = ts['canHaveDecorators'](node)
          ? ts['getDecorators'](node)
          : undefined;
      }
      decorators?.forEach(decorator => {
        const symbol = this.typeChecker.getSymbolAtLocation(
          decorator.expression.getFirstToken()
        );

        if (symbol?.getName() === 'Configuration') {
          collection.configurationClz = (<ts.ClassDeclaration>node).name.text;
          collection.configurationFilepath = node.getSourceFile().fileName;
        }
      });
    } else if (ts.isModuleDeclaration(node)) {
      ts.forEachChild(node, n => this.visit(n, collection));
    }
  }

  public collect(): ExportCollection {
    const collection = {
      exportFiles: [],
    };
    for (const sourceFile of this.program.getSourceFiles()) {
      const filename = sourceFile.fileName;
      if (!isWithin(this.sourceDir, filename)) continue;
      const sourceExports =
        this.typeChecker.getSymbolAtLocation(sourceFile)?.exports;

      if (!!sourceExports && sourceExports.size > 0) {
        if (!collection.exportFiles.includes(filename)) {
          collection.exportFiles.push(filename);
        }
      }

      ts.forEachChild(sourceFile, node => this.visit(node, collection));
    }

    return collection;
  }

  public run() {
    const collection = this.collect();
    const exportCodes = collection.exportFiles
      .filter(path => relative(collection.configurationFilepath, path) !== '')
      .map(path => {
        return `export * from './${formatWindowsPath(
          relative(this.sourceDir, path)
        )
          .replace(extname(path), '')
          .replace(/\\/g, '/')}';\n`;
      });

    exportCodes.unshift(
      `export { ${
        collection.configurationClz
      } as Configuration } from './${formatWindowsPath(
        relative(this.sourceDir, collection.configurationFilepath)
      ).replace(extname(collection.configurationFilepath), '')}';\n`
    );

    exportCodes.unshift(this.BANNER);

    writeFileSync(resolve(this.sourceDir, 'index.ts'), exportCodes.join(''));
  }
}
