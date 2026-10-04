import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import postcss from 'postcss'

const excludedDirectories = new Set(['node_modules', 'dist', '.git'])
const sourceExtensions = /\.(?:[cm]?[jt]sx?)$/i
const testFile = /\.(?:test|spec)\.[cm]?[jt]sx?$/i
const maxSourceBytes = 10 * 1024 * 1024
const rootArtifactDirectory = /^(?:exports?|local-sources|qa(?:-artifacts)?|screenshots?|proofs?|visualizations|coverage|test-results|playwright-report|renders?|artifacts|recordings|экспорты|исходники)$/i
const rootArtifactFile = /(?:\.(?:m4a|mp3|wav|ogg|flac|aac|png|webp|jpe?g|gif|svg|ttf|woff2?|pdf|docx|pptx|xlsx|zip|tar|gz|7z|rar)$|^(?:qa[-_]|screenshot|codex-clipboard-|proof[-_]|бриф_))/i

const normalized = (value) => value.split(path.sep).join('/')
const isRemote = (value) => /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)
const stripQuery = (value) => value.split(/[?#]/, 1)[0]

export function isForbiddenRootEntry(name, isDirectory) {
  return (isDirectory ? rootArtifactDirectory : rootArtifactFile).test(name)
}

export function collectModuleReferences(source, filename) {
  const references = []
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true)
  const literal = (node) => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && literal(node.moduleSpecifier)) {
      references.push(node.moduleSpecifier.text)
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && literal(node.arguments[0])) {
      references.push(node.arguments[0].text)
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'URL'
      && literal(node.arguments?.[0]) && node.arguments?.[1]?.getText(ast) === 'import.meta.url') {
      references.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return references
}

export function collectCssReferences(source, filename) {
  const references = []
  const ast = postcss.parse(source, { from: filename })
  const urls = (value) => {
    for (const match of value.matchAll(/url\(\s*(?:"([^"\\]*)"|'([^'\\]*)'|([^\s)'"\\]+))\s*\)/gi)) {
      references.push(match[1] ?? match[2] ?? match[3])
    }
  }
  ast.walkDecls((declaration) => urls(declaration.value))
  ast.walkAtRules('import', (rule) => {
    const quoted = rule.params.match(/^\s*(['"])(.*?)\1/)
    if (quoted) references.push(quoted[2])
    else urls(rule.params)
  })
  return references
}

export function collectHtmlPreloads(source) {
  const references = []
  for (const tag of source.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = new Map([...tag[0].matchAll(/([\w-]+)\s*=\s*(['"])(.*?)\2/g)]
      .map((match) => [match[1].toLowerCase(), match[3]]))
    if (attributes.get('rel')?.toLowerCase().split(/\s+/).includes('preload') && attributes.has('href')) {
      references.push(attributes.get('href'))
    }
  }
  return references
}

export function auditDeliverable(repoRoot) {
  const root = path.resolve(repoRoot)
  const files = []
  const errors = []
  const usedAssets = new Set()
  let referenceCount = 0

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue
      const absolute = path.join(directory, entry.name)
      const relative = normalized(path.relative(root, absolute))
      if (directory === root && isForbiddenRootEntry(entry.name, entry.isDirectory())) {
        errors.push(`Local source or QA artifact in repository root: ${relative}`)
      }
      if (entry.isSymbolicLink()) {
        errors.push(`Source symlink needs explicit delivery review: ${relative}`)
      } else if (entry.isDirectory()) {
        walk(absolute)
      } else if (entry.isFile()) {
        files.push(absolute)
        if (fs.statSync(absolute).size > maxSourceBytes) errors.push(`Source file exceeds 10 MiB: ${relative}`)
      }
    }
  }

  function recordReference(from, value, isModule = false) {
    if (isRemote(value) || (isModule && !value.startsWith('.') && !value.startsWith('/'))) return
    const specifier = stripQuery(value)
    const candidate = value.startsWith('/') ? path.join(root, specifier.slice(1)) : path.resolve(path.dirname(from), specifier)
    const relative = path.relative(root, candidate)
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
      errors.push(`Reference leaves repository: ${normalized(path.relative(root, from))} -> ${value}`)
      return
    }
    const candidates = isModule
      ? [candidate, ...['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs'].map((extension) => candidate + extension), path.join(candidate, 'index.ts'), path.join(candidate, 'index.tsx')]
      : [candidate]
    const target = candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile())
    referenceCount += 1
    if (!target) {
      errors.push(`Missing local reference: ${normalized(path.relative(root, from))} -> ${value}`)
      return
    }
    if (normalized(path.relative(root, target)).startsWith('src/assets/')) usedAssets.add(target)
  }

  walk(root)
  for (const file of files) {
    const relative = normalized(path.relative(root, file))
    if (relative.startsWith('src/') && sourceExtensions.test(file) && !testFile.test(file)) {
      for (const value of collectModuleReferences(fs.readFileSync(file, 'utf8'), file)) recordReference(file, value, true)
    } else if (relative.startsWith('src/') && file.endsWith('.css')) {
      for (const value of collectCssReferences(fs.readFileSync(file, 'utf8'), file)) recordReference(file, value)
    } else if (relative === 'index.html') {
      for (const value of collectHtmlPreloads(fs.readFileSync(file, 'utf8'))) recordReference(file, value)
    }
  }
  const assets = files.filter((file) => normalized(path.relative(root, file)).startsWith('src/assets/') && !file.endsWith('.md'))
  for (const file of assets) {
    if (!usedAssets.has(file)) errors.push(`Asset has no static runtime reference: ${normalized(path.relative(root, file))}`)
  }
  return { files: files.length, assets: assets.length, references: referenceCount, errors: errors.sort() }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = fileURLToPath(new URL('../', import.meta.url))
  const result = auditDeliverable(repoRoot)
  console.log(`Deliverable audit: ${result.files} source files, ${result.assets} assets, ${result.references} local references`)
  if (result.errors.length) {
    for (const error of result.errors) console.error(`ERROR: ${error}`)
    process.exitCode = 1
  } else {
    console.log('OK: no missing references, zero-reference assets, local source/QA root artifacts or source files over 10 MiB')
  }
}
