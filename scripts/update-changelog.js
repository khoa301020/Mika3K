const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');

function updateChangelog() {
  if (!fs.existsSync(changelogPath)) {
    console.log('CHANGELOG.md not found. Skipping auto-changelog.');
    return;
  }

  let changelogContent = fs.readFileSync(changelogPath, 'utf8');
  
  // Clean up orphaned commits (from git commit --amend or rebase)
  let reachableHashes = new Set();
  try {
    const gitAllOutput = execSync('git log --all --format="%H"').toString().trim();
    reachableHashes = new Set(gitAllOutput.split('\n'));
  } catch(e) {
    console.error('Failed to get reachable git hashes.', e.message);
  }

  let orphanedCount = 0;
  if (reachableHashes.size > 0) {
    const lines = changelogContent.split('\n');
    const cleanedLines = [];
    
    for (const line of lines) {
      const hashMatch = line.match(/commit\/([a-f0-9]{40})/);
      if (hashMatch) {
        const hash = hashMatch[1];
        if (!reachableHashes.has(hash)) {
          // This commit was amended or dropped. Skip it.
          orphanedCount++;
          continue;
        }
      }
      cleanedLines.push(line);
    }
    
    if (orphanedCount > 0) {
      changelogContent = cleanedLines.join('\n');
      console.log(`\x1b[33m[Auto Changelog]\x1b[0m Removed ${orphanedCount} orphaned/amended commits.`);
    }
  }

  // Extract all existing commit full hashes from CHANGELOG.md
  // Using the pattern: /commit/([a-f0-9]{40})/
  const hashRegex = /commit\/([a-f0-9]{40})/g;
  const existingHashes = new Set();
  let match;
  while ((match = hashRegex.exec(changelogContent)) !== null) {
    existingHashes.add(match[1]);
  }

  // Get git log (get top 100 commits to be safe)
  let gitLogOutput = '';
  try {
    gitLogOutput = execSync('git log -n 100 --format="%H|%s"').toString().trim();
  } catch (err) {
    console.error('Failed to get git log: ', err.message);
    return;
  }

  if (!gitLogOutput) {
    return;
  }

  const lines = gitLogOutput.split('\n');
  const newCommits = [];

  for (const line of lines) {
    const splitIndex = line.indexOf('|');
    if (splitIndex === -1) continue;
    
    const hash = line.substring(0, splitIndex).trim();
    const message = line.substring(splitIndex + 1).trim();
    
    // Stop if we reach a commit that is already in the changelog
    if (existingHashes.has(hash)) {
      break;
    }

    // Ignore merge commits, trivial automated commits, or WIPs
    const msgLower = message.toLowerCase();
    if (
      msgLower.startsWith('merge branch') || 
      msgLower.startsWith('merge pull request') || 
      msgLower.includes('changelog') ||
      msgLower === 'wip' ||
      msgLower.includes('ignore')
    ) {
      continue;
    }

    const shortHash = hash.substring(0, 6);
    // Format: - message ([shorthash](url))
    const formattedLine = `- ${message} ([${shortHash}](https://github.com/khoa301020/Mika3K/commit/${hash}))`;
    newCommits.push(formattedLine);
  }

  if (newCommits.length === 0) {
    return;
  }

  // Find the insertion point (right below '## Untagged')
  const insertMarker = '## Untagged';
  const markerIndex = changelogContent.indexOf(insertMarker);
  
  if (markerIndex === -1) {
    console.error('Could not find "## Untagged" in CHANGELOG.md');
    return;
  }

  const endOfMarkerIndex = markerIndex + insertMarker.length;
  
  const textBefore = changelogContent.substring(0, endOfMarkerIndex);
  let textAfter = changelogContent.substring(endOfMarkerIndex);
  
  // Clean up any immediate newlines/spaces right after the marker to keep it uniform
  textAfter = textAfter.replace(/^\s+/, '');
  
  // Create block to insert
  const blockToInsert = '\n\n' + newCommits.join('\n') + '\n';
  
  const newContent = textBefore + blockToInsert + textAfter;

  fs.writeFileSync(changelogPath, newContent, 'utf8');
  
  try {
    // Stage the changed changelog so it's included in the current commit
    execSync(`git add "${changelogPath}"`);
    console.log(`\x1b[32m[Auto Changelog]\x1b[0m Added ${newCommits.length} previous commits to CHANGELOG.md`);
  } catch (err) {
    console.error('\x1b[31m[Auto Changelog]\x1b[0m Failed to git add CHANGELOG.md');
  }
}

updateChangelog();
