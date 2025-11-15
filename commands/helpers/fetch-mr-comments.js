#!/usr/bin/env node

/**
 * Fetch unresolved review comments from GitHub PR or GitLab MR
 * Usage: node fetch-mr-comments.js [MR_ID_OR_URL]
 * 
 * Environment Variables:
 * - GITHUB_TOKEN: GitHub Personal Access Token
 * - GITLAB_TOKEN: GitLab Personal Access Token
 */

import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

// Output JSON result
function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function error(message) {
  output({ success: false, error: message });
  process.exit(1);
}

// Parse MR/PR identifier from argument
function parseIdentifier(arg) {
  if (!arg) {
    error('Missing MR/PR ID or URL argument');
  }

  // Extract ID from URL patterns
  const githubMatch = arg.match(/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/);
  const gitlabMatch = arg.match(/gitlab\.com\/[^/]+\/[^/]+\/-\/merge_requests\/(\d+)/);
  
  if (githubMatch) {
    return { id: githubMatch[1], provider: 'github' };
  }
  if (gitlabMatch) {
    return { id: gitlabMatch[1], provider: 'gitlab' };
  }

  // Check if it's just a number
  const numMatch = arg.match(/^(\d+)$/);
  if (numMatch) {
    return { id: numMatch[1], provider: null }; // Will detect from git remote
  }

  error('Invalid MR/PR identifier format');
}

// Get git remote URL
function getGitRemote() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    return remote;
  } catch (e) {
    error('Not a git repository or no remote configured');
  }
}

// Get current git branch
function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branch;
  } catch (e) {
    return 'unknown';
  }
}

// Detect provider from git remote
function detectProvider(remote) {
  if (remote.includes('github.com')) {
    return 'github';
  }
  if (remote.includes('gitlab.com')) {
    return 'gitlab';
  }
  error('Unsupported git provider (only GitHub and GitLab supported)');
}

// Parse owner and repo from GitHub URL
function parseGitHubRemote(remote) {
  const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?/);
  if (!match) {
    error('Could not parse GitHub repository from remote URL');
  }
  return { owner: match[1], repo: match[2] };
}

// Parse group and project from GitLab URL
function parseGitLabRemote(remote) {
  const match = remote.match(/gitlab\.com[:/](.+?)\/([^/.]+?)(\.git)?$/);
  if (!match) {
    error('Could not parse GitLab repository from remote URL');
  }
  return { group: match[1], project: match[2] };
}

// Make HTTPS request
function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: headers || {}
    };

    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Fetch GitHub PR review comments and branch info
async function fetchGitHubData(owner, repo, prId, token) {
  if (!token) {
    error('Missing GITHUB_TOKEN environment variable. Get one from: https://github.com/settings/tokens');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'cursor-fixmr'
  };

  try {
    // Fetch PR details (includes branch info)
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prId}`;
    const pr = await makeRequest(prUrl, headers);

    // Fetch review comments (inline comments on code)
    const reviewCommentsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prId}/comments`;
    const reviewComments = await makeRequest(reviewCommentsUrl, headers);

    // Fetch pull request reviews
    const reviewsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prId}/reviews`;
    const reviews = await makeRequest(reviewsUrl, headers);

    const comments = [];

    // Process inline review comments (these are the most important)
    for (const comment of reviewComments) {
      // GitHub doesn't have an explicit "resolved" field on review comments
      // We consider all comments as unresolved unless explicitly marked (GitHub doesn't mark them)
      // In practice, if a comment exists and isn't deleted, it's unresolved
      comments.push({
        file: comment.path,
        line: comment.line || comment.original_line,
        text: comment.body.trim(),
        reviewer: comment.user.login,
        thread_id: comment.id.toString(),
        url: comment.html_url
      });
    }

    // Process review-level comments (not tied to specific lines)
    for (const review of reviews) {
      if (review.state === 'COMMENTED' && review.body && review.body.trim()) {
        comments.push({
          file: null, // Review-level comment, not file-specific
          line: null,
          text: review.body.trim(),
          reviewer: review.user.login,
          thread_id: review.id.toString(),
          url: review.html_url
        });
      }
    }

    return {
      comments,
      branch: pr.head.ref,
      baseBranch: pr.base.ref
    };
  } catch (e) {
    error(`GitHub API error: ${e.message}`);
  }
}

// Fetch GitLab MR discussion comments and branch info
async function fetchGitLabData(group, project, mrId, token) {
  if (!token) {
    error('Missing GITLAB_TOKEN environment variable. Get one from: GitLab → Settings → Access Tokens');
  }

  const headers = {
    'PRIVATE-TOKEN': token,
    'User-Agent': 'cursor-fixmr'
  };

  const projectPath = encodeURIComponent(`${group}/${project}`);

  try {
    // Fetch MR details (includes branch info)
    const mrUrl = `https://gitlab.com/api/v4/projects/${projectPath}/merge_requests/${mrId}`;
    const mr = await makeRequest(mrUrl, headers);

    // Fetch discussions
    const discussionsUrl = `https://gitlab.com/api/v4/projects/${projectPath}/merge_requests/${mrId}/discussions`;
    const discussions = await makeRequest(discussionsUrl, headers);

    const comments = [];

    for (const discussion of discussions) {
      for (const note of discussion.notes) {
        // Only include unresolved, resolvable notes (actual review comments)
        if (note.resolvable && !note.resolved) {
          const position = note.position || {};
          comments.push({
            file: position.new_path || position.old_path || null,
            line: position.new_line || position.old_line || null,
            text: note.body.trim(),
            reviewer: note.author?.username || 'unknown',
            thread_id: discussion.id,
            url: `https://gitlab.com/${group}/${project}/-/merge_requests/${mrId}#note_${note.id}`
          });
        }
      }
    }

    return {
      comments,
      branch: mr.source_branch,
      baseBranch: mr.target_branch
    };
  } catch (e) {
    error(`GitLab API error: ${e.message}`);
  }
}

// Main execution
async function main() {
  const arg = process.argv[2];
  const parsed = parseIdentifier(arg);
  
  const remote = getGitRemote();
  const provider = parsed.provider || detectProvider(remote);
  const mrId = parsed.id;
  const currentBranch = getCurrentBranch();

  let data = {};

  if (provider === 'github') {
    const { owner, repo } = parseGitHubRemote(remote);
    const token = process.env.GITHUB_TOKEN;
    data = await fetchGitHubData(owner, repo, mrId, token);
  } else if (provider === 'gitlab') {
    const { group, project } = parseGitLabRemote(remote);
    const token = process.env.GITLAB_TOKEN;
    data = await fetchGitLabData(group, project, mrId, token);
  }

  // Filter out comments without file/line (optional: keep them or remove them)
  // For now, we'll keep all comments but mark those without file location
  const processedComments = data.comments.map(c => ({
    ...c,
    file: c.file || '(general comment)',
    line: c.line || 0
  }));

  const needsCheckout = currentBranch !== data.branch;

  output({
    success: true,
    provider: provider,
    mr_id: mrId,
    branch: data.branch,
    base_branch: data.baseBranch,
    current_branch: currentBranch,
    needs_checkout: needsCheckout,
    comments: processedComments,
    total: processedComments.length
  });
}

main().catch(e => {
  error(`Unexpected error: ${e.message}`);
});

