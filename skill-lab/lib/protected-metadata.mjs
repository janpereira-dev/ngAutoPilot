export function extractFrontmatterBlock(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---/);
  return match?.[0] ?? '';
}

export function frontmatterIsByteEqual(baselineContent, candidateContent) {
  return extractFrontmatterBlock(baselineContent) === extractFrontmatterBlock(candidateContent);
}

export function splitSkill(content) {
  const frontmatter = extractFrontmatterBlock(content);
  return {
    frontmatter,
    body: frontmatter ? content.slice(frontmatter.length) : content,
  };
}
