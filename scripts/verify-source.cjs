/* Static source check. Run from the project root after npm ci. */
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = process.cwd();
const source = path.join(root, "src");
const exts = ["", ".ts", ".tsx", ".js", ".jsx", ".json", ".css"];
const errors = [];
const missingAssets = [];
let edges = 0;
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}
function exists(base) {
  return exts.some((ext) => isFile(base + ext)) || exts.slice(1).some((ext) => isFile(path.join(base, "index" + ext)));
}
const files = walk(source).filter((p) => /\.[jt]sx?$/.test(p));
const program = ts.createProgram(files, { allowJs: true, checkJs: false, noEmit: true, jsx: ts.JsxEmit.Preserve, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, baseUrl: root, paths: { "@/*": ["src/*"] }, skipLibCheck: true });
for (const diagnostic of program.getSyntacticDiagnostics()) {
  errors.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, " ") + " at " + diagnostic.file?.fileName);
}
for (const file of files) {
  const sf = program.getSourceFile(file);
  if (!sf) continue;
  function check(node) {
    if (!node || !ts.isStringLiteralLike(node)) return;
    const spec = node.text;
    if (!spec.startsWith("@/") && !spec.startsWith(".")) return;
    edges++;
    const dest = spec.startsWith("@/") ? path.join(source, spec.slice(2)) : path.resolve(path.dirname(file), spec);
    if (exists(dest)) return;
    const msg = `${path.relative(root, file)}: ${spec}`;
    if (/\.(png|jpe?g|webp|svg|gif|ico|avif|woff2?)$/i.test(spec)) missingAssets.push(msg);
    else errors.push(`Missing local import: ${msg}`);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) check(node.moduleSpecifier);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) check(node.arguments[0]);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) check(node.argument.literal);
    ts.forEachChild(node, visit);
  }
  visit(sf);
}
for (const error of errors) console.error(error);
for (const asset of missingAssets) console.warn(`Missing asset: ${asset}`);
console.log(JSON.stringify({ sourceFiles: files.length, localImportReferences: edges, errors: errors.length, missingAssets: missingAssets.length }, null, 2));
if (errors.length || (missingAssets.length && process.argv.includes("--require-assets"))) process.exitCode = 1;
