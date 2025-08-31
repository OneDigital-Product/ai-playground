#!/usr/bin/env node
/*
  Zero-download Ignored Build Step for Vercel + Turborepo
  - Runs in any app directory (apps/*)
  - Uses git diff on the app and its in-repo workspace dependencies
  - Exits 0 if unaffected (skip build); exits 1 if affected (build)
*/

const { spawnSync } = require('node:child_process');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');

function log(msg) {
  process.stdout.write(String(msg) + "\n");
}

function err(msg) {
  process.stderr.write(String(msg) + "\n");
}

function repoRoot() {
  // scripts/turbo-ignore.js lives at <repo>/scripts
  return path.resolve(__dirname, '..');
}

function readJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function getWorkspaceNameAndDir(cwd) {
  // cwd is app directory (Vercel sets workingDir to project root dir)
  const pkgPath = path.join(cwd, 'package.json');
  const pkg = readJSON(pkgPath);
  return { name: pkg.name, dir: cwd, pkg };
}

function mapWorkspaceNameToDir(root, name) {
  // Look under packages/* and apps/* for matching package.json name
  const candidates = ['packages', 'apps'];
  for (const base of candidates) {
    const baseDir = path.join(root, base);
    try {
      const entries = require('node:fs').readdirSync(baseDir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const p = path.join(baseDir, e.name, 'package.json');
        if (existsSync(p)) {
          try {
            const pkg = readJSON(p);
            if (pkg.name === name) {
              return path.dirname(p);
            }
          } catch {}
        }
      }
    } catch {}
  }
  return null;
}

function collectWorkspaceDependencyDirs(root, appPkg) {
  const dirs = new Set();
  const depMaps = [appPkg.dependencies, appPkg.devDependencies, appPkg.peerDependencies].filter(Boolean);
  const names = new Set();
  for (const depMap of depMaps) {
    for (const [dep, ver] of Object.entries(depMap)) {
      if (typeof ver === 'string' && ver.startsWith('workspace:')) {
        names.add(dep);
      }
    }
  }
  for (const depName of names) {
    const dir = mapWorkspaceNameToDir(root, depName);
    if (dir) dirs.add(dir);
  }
  return Array.from(dirs);
}

function git(args, opts = {}) {
  const res = spawnSync('git', args, { stdio: 'inherit', ...opts });
  return res.status ?? res.signal ?? 1;
}

function gitQuiet(args, opts = {}) {
  const res = spawnSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  return { status: res.status ?? res.signal ?? 1, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function shouldTriggerForLockfileChanges(root, appPkg) {
  try {
    // Get all dependencies for this app
    const allDeps = new Set([
      ...Object.keys(appPkg.dependencies || {}),
      ...Object.keys(appPkg.devDependencies || {}),
      ...Object.keys(appPkg.peerDependencies || {})
    ]);

    if (allDeps.size === 0) {
      return false; // No deps = no lockfile concerns
    }

    // Get the lockfile diff
    const lockfileDiff = gitQuiet(['diff', 'HEAD^', 'HEAD', 'pnpm-lock.yaml'], { cwd: root });
    
    if (lockfileDiff.status !== 0 || !lockfileDiff.stdout) {
      // No lockfile changes or can't read diff
      return false;
    }

    const diffContent = lockfileDiff.stdout;
    
    // First, check if this app's specific section in the lockfile changed
    const appRelativeDir = path.relative(root, path.dirname(path.join(root, appPkg.name === 'web' ? 'apps/web' : 
      appPkg.name === 'docs' ? 'apps/docs' : 
      appPkg.name === 'admin' ? 'apps/admin' : 
      appPkg.name === '@product/host' ? 'apps/host' : 'unknown')));
    
    // Look for changes in this specific app's lockfile section
    if (diffContent.includes(`${appRelativeDir}:`)) {
      log(`≫ lockfile change in app-specific section: ${appRelativeDir}`);
      return true;
    }
    
    // Also check for changes to shared workspace dependencies that this app uses
    for (const dep of allDeps) {
      if (dep.startsWith('@repo/') || dep.startsWith('workspace:')) {
        const patterns = [
          `"${dep}":`,           // Direct dependency entry
          `/${dep}@`,            // Package reference
          `/${dep}/`,            // Package path
          `'${dep}':`,           // Alternative quote style
          ` ${dep}@`,            // Version reference
        ];
        
        if (patterns.some(pattern => diffContent.includes(pattern))) {
          log(`≫ lockfile change affects workspace dependency: ${dep}`);
          return true;
        }
      }
    }

    return false;
  } catch (e) {
    // Fail safe: if we can't analyze, assume it affects this app
    log(`≫ lockfile analysis failed (${e.message}), assuming affected`);
    return true;
  }
}

(function main() {
  try {
    const root = repoRoot();
    const cwd = process.cwd();
    const { pkg } = getWorkspaceNameAndDir(cwd);

    // Build list of paths relative to repo root to check for changes
    const paths = [];
    const relApp = path.relative(root, cwd) || '.';
    paths.push(relApp);

    // Include in-repo workspace deps of this app (e.g., packages/ui for web/docs)
    const workspaceDepDirs = collectWorkspaceDependencyDirs(root, pkg);
    for (const d of workspaceDepDirs) {
      const rel = path.relative(root, d) || '.';
      paths.push(rel);
    }

    // Include turbo.json as it affects all apps, but handle pnpm-lock.yaml smartly
    if (existsSync(path.join(root, 'turbo.json'))) {
      paths.push('turbo.json');
    }
    
    // Smart lockfile analysis: only include if changes affect this app's dependencies
    if (existsSync(path.join(root, 'pnpm-lock.yaml')) && shouldTriggerForLockfileChanges(root, pkg)) {
      paths.push('pnpm-lock.yaml');
    }

    log(`≫ turbo-ignore (zero-download): checking paths -> ${paths.join(', ')}`);

    // Ensure we can diff against previous commit; if not, force build (exit 1)
    const hasPrev = gitQuiet(['rev-parse', 'HEAD^'], { cwd: root }).status === 0;
    if (!hasPrev) {
      err('No previous commit found; proceeding with build');
      process.exit(1);
      return;
    }

    // Check if any of the relevant paths changed in the last commit
    const diff = spawnSync('git', ['diff', '--quiet', 'HEAD^', 'HEAD', '--', ...paths], { cwd: root });
    if (diff.status === 0) {
      log('⏭ Unaffected: no relevant changes detected');
      process.exit(0); // skip build
    } else {
      log('✓ Affected: relevant changes detected');
      process.exit(1); // proceed with build
    }
  } catch (e) {
    // Fail-open: proceed with build if anything goes wrong
    err(`Error during turbo-ignore: ${e?.stack || e}`);
    process.exit(1);
  }
})();

