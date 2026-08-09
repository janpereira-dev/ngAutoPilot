export function scanCandidateSecurity(content, { includeSkillPermissions = true } = {}) {
  const findings = [];

  reportMatches(findings, content, /^(?:<<<<<<<|=======|>>>>>>>)$/m, 'contains unresolved merge marker');
  reportMatches(findings, content, /[\u200B-\u200D\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/, 'contains invisible or bidirectional Unicode control character');
  reportMatches(findings, content, /^\s*(?:curl|wget)\b[^\r\n|]*\|\s*(?:sudo\s+)?(?:ba)?sh\b/im, 'contains remote shell execution pipeline');
  reportMatches(findings, content, /^\s*(?:curl|iwr|irm|Invoke-WebRequest)\b[^\r\n|]*\|\s*(?:iex|Invoke-Expression)\b/im, 'contains remote PowerShell execution pipeline');
  reportMatches(findings, content, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'contains private key material');
  reportMatches(findings, content, /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|npm_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/, 'contains credential-shaped token');

  if (includeSkillPermissions && grantsBroadShellAccess(content)) {
    findings.push('allowed-tools grants broad shell access');
  }

  return findings;
}

function reportMatches(findings, content, pattern, message) {
  if (pattern.test(content)) {
    findings.push(message);
  }
}

function grantsBroadShellAccess(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const allowedTools = frontmatter?.[1].match(/^allowed-tools:\s*(.+)$/m)?.[1] ?? '';

  return /\b(?:shell|bash|cmd|powershell|terminal|all)\b|\*/i.test(allowedTools);
}
