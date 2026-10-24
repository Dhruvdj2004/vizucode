// Type-checks one generated visualizer module exactly as `npm run build`
// (tsc -b) would, without writing it to disk: the module is served from
// memory at src/problems/generated/<slug>.ts, everything it imports
// (lib/types, lib/parse, lib/trace) is read from the real repo. The browser
// preview only strips types, so this is what stops a module that runs but
// would break the site's build from being published.
import ts from 'typescript';
import path from 'node:path';

const ROOT = process.cwd();
let options: ts.CompilerOptions | null = null;

function compilerOptions(): ts.CompilerOptions {
  if (options) return options;
  const cfg = ts.readConfigFile(path.join(ROOT, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ROOT);
  options = { ...parsed.options, noEmit: true };
  return options;
}

/** Type errors as "line N: message", at most 20 of them; [] means it compiles. */
export function typecheckModule(code: string, slug: string): string[] {
  const file = path.join(ROOT, 'src', 'problems', 'generated', `${slug}.ts`);
  const opts = compilerOptions();
  const host = ts.createCompilerHost(opts);
  const baseGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, lang, onError, shouldCreate) =>
    path.resolve(name) === file ? ts.createSourceFile(name, code, lang) : baseGet(name, lang, onError, shouldCreate);
  const baseExists = host.fileExists.bind(host);
  host.fileExists = (name) => path.resolve(name) === file || baseExists(name);
  const baseRead = host.readFile.bind(host);
  host.readFile = (name) => (path.resolve(name) === file ? code : baseRead(name));

  const program = ts.createProgram([file], opts, host);
  const sf = program.getSourceFile(file);
  const diags = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
  return diags.slice(0, 20).map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n').split('\n')[0];
    if (d.file && d.start !== undefined) {
      const { line } = d.file.getLineAndCharacterOfPosition(d.start);
      return `line ${line + 1}: ${msg}`;
    }
    return msg;
  });
}
