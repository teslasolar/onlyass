/**
 * MCP Tools Engine — A.S.S. Edition
 * Virtual filesystem, git-like VCS, tool parsing & execution
 * All operations logged through ASSLogger with prime-factored IDs
 *
 * Pipe mapping:
 *   p=2  (ground)  → filesystem (what you're standing on)
 *   p=3  (signal)  → input parsing (what comes in)
 *   p=5  (gate)    → validation/filtering (what gets through)
 *   p=7  (heart)   → preview/rendering (the beating core)
 *   p=11 (voice)   → chat/LLM interaction (what you decide)
 *   p=13 (mirror)  → model/identity (who is the AI)
 *   p=17 (watcher) → tool viz/observability (who sees it all)
 */

// Virtual filesystem
const fs = {};
let repoName = 'untitled';
let currentBranch = 'main';
const commits = [];
let commitSeq = 0;
const staged = new Set();

// ─── File Operations (p=2 ground) ───

export function createFile(path, content = '') {
  if (!path.startsWith('/')) path = '/' + path;
  if (fs[path]) return { ok: false, error: `file exists: ${path}` };
  fs[path] = { content, created: Date.now(), modified: Date.now() };
  staged.add(path);
  return { ok: true, path, size: content.length, summary: `created ${path}` };
}

export function editFile(path, content) {
  if (!path.startsWith('/')) path = '/' + path;
  if (!fs[path]) return { ok: false, error: `not found: ${path}` };
  fs[path].content = content;
  fs[path].modified = Date.now();
  staged.add(path);
  return { ok: true, path, size: content.length, summary: `edited ${path}` };
}

export function patchFile(path, search, replace) {
  if (!path.startsWith('/')) path = '/' + path;
  if (!fs[path]) return { ok: false, error: `not found: ${path}` };
  if (!fs[path].content.includes(search)) return { ok: false, error: `search string not found in ${path}` };
  fs[path].content = fs[path].content.replace(search, replace);
  fs[path].modified = Date.now();
  staged.add(path);
  return { ok: true, path, summary: `patched ${path}` };
}

export function readFile(path) {
  if (!path.startsWith('/')) path = '/' + path;
  if (!fs[path]) return { ok: false, error: `not found: ${path}` };
  const f = fs[path];
  const ext = path.split('.').pop().toLowerCase();
  const typeMap = { html: 'html', htm: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown', txt: 'text' };
  return { ok: true, path, content: f.content, size: f.content.length, type: typeMap[ext] || 'text', modified: f.modified };
}

export function deleteFile(path) {
  if (!path.startsWith('/')) path = '/' + path;
  if (!fs[path]) return { ok: false, error: `not found: ${path}` };
  delete fs[path];
  staged.delete(path);
  return { ok: true, path, summary: `deleted ${path}` };
}

export function listFiles(dir = '/') {
  const files = Object.keys(fs)
    .filter(p => p.startsWith(dir))
    .sort()
    .map(p => {
      const ext = p.split('.').pop().toLowerCase();
      const typeMap = { html: 'html', htm: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown' };
      return { path: p, size: fs[p].content.length, type: typeMap[ext] || 'text', modified: fs[p].modified };
    });
  return { ok: true, files, count: files.length };
}

export function searchFiles(query) {
  const results = [];
  const q = query.toLowerCase();
  for (const [path, file] of Object.entries(fs)) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(q)) {
        results.push({ path, line: i + 1, text: lines[i].trim().slice(0, 100) });
      }
    }
  }
  return { ok: true, results, count: results.length };
}

export function getAllFiles() {
  return Object.keys(fs).sort();
}

// ─── Git-like VCS (p=17 watcher) ───

export function initRepo(name) {
  repoName = name || 'untitled';
  currentBranch = 'main';
  // Clear filesystem
  for (const k of Object.keys(fs)) delete fs[k];
  commits.length = 0;
  commitSeq = 0;
  staged.clear();
  // Initial commit
  commits.push({
    id: 'a000000',
    message: `init: ${repoName}`,
    timestamp: Date.now(),
    files: [],
    branch: currentBranch
  });
  return { ok: true, name: repoName, branch: currentBranch };
}

export function commitChanges(message) {
  commitSeq++;
  const id = commitSeq.toString(16).padStart(7, '0');
  const files = [...staged];
  staged.clear();
  const commit = { id, message, timestamp: Date.now(), files, branch: currentBranch };
  commits.push(commit);
  return { ok: true, id, message, fileCount: files.length, summary: `committed: ${message}` };
}

export function getLog(n = 10) {
  return { ok: true, commits: commits.slice(-n).reverse(), count: commits.length };
}

export function getDiff() {
  const files = [...staged];
  return { ok: true, staged: files, count: files.length };
}

export function checkout(branch) {
  currentBranch = branch;
  return { ok: true, branch };
}

export function getRepoState() {
  const files = Object.keys(fs).sort();
  return {
    name: repoName,
    branch: currentBranch,
    fileCount: files.length,
    files,
    commitCount: commits.length,
    staged: [...staged]
  };
}

// ─── Preview (p=7 heart) ───

export function getPreviewHTML(path) {
  if (!path.startsWith('/')) path = '/' + path;
  if (!fs[path]) return { ok: false, error: `not found: ${path}` };
  // Resolve relative CSS/JS references within the virtual FS
  let html = fs[path].content;
  // Inline <link href="...css"> from virtual FS
  html = html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => {
    const cssPath = href.startsWith('/') ? href : '/' + href;
    if (fs[cssPath]) return `<style>/* ${cssPath} */\n${fs[cssPath].content}</style>`;
    return match;
  });
  // Inline <script src="...js"> from virtual FS
  html = html.replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (match, src) => {
    const jsPath = src.startsWith('/') ? src : '/' + src;
    if (fs[jsPath]) return `<script>/* ${jsPath} */\n${fs[jsPath].content}<\/script>`;
    return match;
  });
  return { ok: true, html, path };
}

export function getPreviewableFiles() {
  const files = Object.keys(fs).filter(p => /\.(html?|svg)$/i.test(p)).sort();
  return { ok: true, files };
}

// ─── Tool System (p=5 gate) ───

const TOOLS = {
  create_file: { params: ['path', 'content'], fn: (a) => createFile(a.path, a.content || '') },
  edit_file: { params: ['path', 'content'], fn: (a) => editFile(a.path, a.content) },
  patch_file: { params: ['path', 'search', 'replace'], fn: (a) => patchFile(a.path, a.search, a.replace) },
  read_file: { params: ['path'], fn: (a) => readFile(a.path) },
  delete_file: { params: ['path'], fn: (a) => deleteFile(a.path) },
  list_files: { params: [], fn: (a) => listFiles(a.dir || '/') },
  search: { params: ['query'], fn: (a) => searchFiles(a.query) },
  commit: { params: ['message'], fn: (a) => commitChanges(a.message || 'auto-commit') },
  preview: { params: ['path'], fn: (a) => getPreviewHTML(a.path) }
};

export function executeTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) return { ok: false, error: `unknown tool: ${name}` };
  try {
    return tool.fn(args);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Parse tool calls from LLM output.
 * Supports multiple formats small models might emit:
 *   ```create /path\ncontent\n```
 *   ```edit /path\ncontent\n```
 *   ```commit message\n```
 *   ```list```
 *   <tool_call>{"name":"...","args":{...}}</tool_call>
 *   JSON tool call blocks
 */
export function parseToolCalls(text) {
  const calls = [];

  // Format 1: ```action /path\ncontent\n```
  const fenceRe = /```\s*(create|edit|patch|delete|commit|list|search|preview|read)\s*(\/[\w\-\.\/]*)?(?:\s*\n([\s\S]*?))?```/gi;
  let m;
  while ((m = fenceRe.exec(text)) !== null) {
    const action = m[1].toLowerCase();
    const path = m[2] || '';
    const body = (m[3] || '').trimEnd();

    switch (action) {
      case 'create':
        calls.push({ name: 'create_file', args: { path: path.trim(), content: body } });
        break;
      case 'edit':
        calls.push({ name: 'edit_file', args: { path: path.trim(), content: body } });
        break;
      case 'delete':
        calls.push({ name: 'delete_file', args: { path: path.trim() } });
        break;
      case 'commit':
        calls.push({ name: 'commit', args: { message: (path + ' ' + body).trim() || 'auto-commit' } });
        break;
      case 'list':
        calls.push({ name: 'list_files', args: {} });
        break;
      case 'search':
        calls.push({ name: 'search', args: { query: (path + ' ' + body).trim() } });
        break;
      case 'preview':
        calls.push({ name: 'preview', args: { path: path.trim() } });
        break;
      case 'read':
        calls.push({ name: 'read_file', args: { path: path.trim() } });
        break;
    }
  }

  // Format 2: <tool_call>JSON</tool_call>
  const xmlRe = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
  while ((m = xmlRe.exec(text)) !== null) {
    try {
      const tc = JSON.parse(m[1]);
      if (tc.name && TOOLS[tc.name]) {
        calls.push({ name: tc.name, args: tc.args || tc.parameters || {} });
      }
    } catch (e) { /* skip malformed */ }
  }

  return calls;
}

export function buildToolSystemPrompt() {
  return `You are an AI coding assistant in the A.S.S. (Autonomic Serenade System) sandbox.
You have MCP tools to create, edit, and manage files in a virtual repository.

AVAILABLE TOOLS — use code fences with the action name:

\`\`\`create /path/to/file.ext
file content here
\`\`\`

\`\`\`edit /path/to/file.ext
full new content
\`\`\`

\`\`\`delete /path/to/file.ext
\`\`\`

\`\`\`commit message here
\`\`\`

\`\`\`list
\`\`\`

\`\`\`search query
\`\`\`

\`\`\`preview /path/to/file.html
\`\`\`

IMPORTANT RULES:
- Always use \`\`\`create to make new files (include the FULL content)
- Use \`\`\`edit to replace entire file content
- HTML files auto-preview in the sandbox
- Commit after meaningful changes
- Be concise but thorough
- When creating HTML, make it self-contained with inline CSS/JS
- The sandbox runs entirely in-browser — no server, no Node.js

Respond conversationally, then use tool fences to take action. Always explain what you're doing.`;
}
