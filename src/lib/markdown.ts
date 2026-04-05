/**
 * Simple markdown → HTML converter for Vinora's guide content.
 * Handles: headings, bold, italic, blockquotes, lists, HR, paragraphs.
 * Uses dangerouslySetInnerHTML — only safe because content is our own files, not user input.
 */
export function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      output.push('<hr>');
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      output.push(`<h3>${inline(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      output.push(`<h2>${inline(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      output.push(`<h1>${inline(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      i++;
      continue;
    }

    // Unordered list — collect consecutive items
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i++;
      }
      output.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Numbered list — collect consecutive items
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      output.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Paragraph — collect lines until blank
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^[#>-]/) && !lines[i].match(/^\d+\. /)) {
      paraLines.push(inline(lines[i]));
      i++;
    }
    if (paraLines.length > 0) {
      output.push(`<p>${paraLines.join(' ')}</p>`);
    }
  }

  return output.join('\n');
}

/** Process inline markdown: bold, italic, code */
function inline(text: string): string {
  return text
    // Bold+italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic (avoiding already-processed bold)
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
