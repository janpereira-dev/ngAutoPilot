import { execFileSync } from 'node:child_process';
import { buildSagePacket } from '../lib/sage-review.mjs';
const sourceRoot = process.cwd();
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim();
const workingTreeDirty = Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: sourceRoot, encoding: 'utf8' }).trim());
const { output, manifest } = buildSagePacket({ sourceRoot, commit, workingTreeDirty });
console.log(`Prepared Sage review packet in ${output} (${manifest.files.length} files, ${manifest.packetSha256}); NOT_APPROVED`);
