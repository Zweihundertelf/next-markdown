export enum AstNodeType {
  TEXT = 'text',
  BREAK = 'break',
  THEMATIC_BREAK = 'thematic_break',
  HEADING = 'heading',
  IMAGE = 'image',
  PARAGRAPH = 'paragraph',
  ANCHOR = 'anchor',
  STRONG = 'strong',
  ITALIC = 'italic',
  STRIKETHROUGH = 'strikethrough',
  CODE = 'code',
}

type AstNode = {
  type: AstNodeType;
  value?: string;
  children?: [{ type: AstNodeType; value: string; children?: [{ type: AstNodeType; value: string }] }] | any;
};

const parseMarkdown = (markdown: string): AstNode[] => {
  const lines: any = markdown.trim().split('\n');
  const ast: AstNode[] = [];

  const codeBlocks = lines.join('\n').match(/\`\`\`([\s\S]*?)\n\`\`\`/g);
  if (codeBlocks !== null) {
    for (const block of codeBlocks) {
      const startIndex = lines.indexOf(block.split('\n')[0]);
      const endIndex = lines.indexOf(block.split('\n').slice(-2, -1)[0]) + 1;
      lines.splice(startIndex, endIndex - startIndex + 1, block);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line: any = lines[i];

    // BREAK
    if (/^\s*$/.test(line)) {
      ast.push({ type: AstNodeType.BREAK });
      continue;
    }
    // THEMATIC BREAK
    if (/^(---)/.test(line)) {
      ast.push({ type: AstNodeType.THEMATIC_BREAK });
    }

    // HEADING
    if (/^(#)/.test(line)) {
      const level = line.match(/^#+/) ? line.match(/^#+/)[0].length : null;
      ast.push({
        type: AstNodeType.HEADING,
        value: line.replace(/^#+\s*/, ''),
        children: [{ type: AstNodeType.TEXT, value: level }],
      });
      continue;
    }

    // CODE
    if (/^(```)[\s\S]*(```)/.test(line)) {
      const [language, title] = line
        .substring(line.indexOf('`') + 3, line.indexOf('\n'))
        .trim()
        .split(' ');

      ast.push({
        type: AstNodeType.CODE,
        value: line.substring(line.indexOf('\n')).slice(0, -4).trim(),
        children: [{ type: AstNodeType.TEXT, value: language }],
      });
      continue;
    }

    // PARAGRAPH
    if (
      /^([A-Z]|[a-z])/.test(line) ||
      /^!\[(.*?)\]\((.*?)\)/.test(line) ||
      /^\[(.*?)\]\((.*?)\)+/.test(line) ||
      /^\*\*(.*?)\*\*/.test(line) ||
      /^\*(.*?)\*/.test(line) ||
      /^\~\~(.*?)\~\~/.test(line)
    ) {
      const paragraph: AstNode = { type: AstNodeType.PARAGRAPH, children: [] };
      let index: number = 0;

      while (index < line.length) {
        // IMAGE
        const matchImage = line.slice(index).match(/!\[(.*?)\]\((.*?)\)/);
        if (matchImage) {
          if (matchImage.index > 0) {
            paragraph.children.push({ type: AstNodeType.TEXT, value: line.slice(index, index + matchImage.index) });
            index += matchImage.index;
          }
          paragraph.children.push({
            type: AstNodeType.IMAGE,
            value: matchImage[2],
            children: [{ type: AstNodeType.TEXT, value: matchImage[1] }],
          });
          index += matchImage[0].length;
          continue;
        }

        // ANCHOR
        const matchAnchor = line.slice(index).match(/\[(.*?)\]\((.*?)\)(?:\{([^{}]+)\})?/);
        if (matchAnchor) {
          // RENAME IT
          const onPage = /^(https?:\/\/)/.test(matchAnchor[2]) ? false : true;
          let target;

          console.log(matchAnchor);

          if (line.slice(index).match(/target="([^"]+)"/) !== null) {
            target = line.slice(index).match(/target="([^"]+)"/)[1];
          }

          if (matchAnchor.index > 0) {
            paragraph.children.push({ type: AstNodeType.TEXT, value: line.slice(index, index + matchAnchor.index), target: target, onPage: onPage });
            index += matchAnchor.index;
          }

          paragraph.children.push({
            type: AstNodeType.ANCHOR,
            value: matchAnchor[2],
            children: [{ type: AstNodeType.TEXT, value: matchAnchor[1] }],
            target: target,
            onPage: onPage,
          });
          index += matchAnchor[0].length;
          continue;
        }

        // BOLD
        const matchBold = line.slice(index).match(/\*\*(.*?)\*\*/);
        if (matchBold) {
          if (matchBold.index > 0) {
            paragraph.children.push({ type: AstNodeType.TEXT, value: line.slice(index, index + matchBold.index) });
            index += matchBold.index;
          }
          paragraph.children.push({
            type: AstNodeType.STRONG,
            value: matchBold[1],
          });
          index += matchBold[0].length;
          continue;
        }
        // ITALIC
        const matchItalic = line.slice(index).match(/\*(.*?)\*/);
        if (matchItalic) {
          if (matchItalic.index > 0) {
            paragraph.children.push({ type: AstNodeType.TEXT, value: line.slice(index, index + matchItalic.index) });
            index += matchItalic.index;
          }
          paragraph.children.push({
            type: AstNodeType.ITALIC,
            value: matchItalic[1],
          });
          index += matchItalic[0].length;
          continue;
        }
        // STRIKETHROUGH
        const matchStrikethrough = line.slice(index).match(/\~\~(.*?)\~\~/);
        if (matchStrikethrough) {
          if (matchStrikethrough.index > 0) {
            paragraph.children.push({
              type: AstNodeType.TEXT,
              value: matchStrikethrough,
            });
            index += matchStrikethrough.index;
          }
          paragraph.children.push({
            type: AstNodeType.STRIKETHROUGH,
            value: matchStrikethrough[1],
          });
          index += matchStrikethrough[0].length;
          continue;
        }
        paragraph.children.push({ type: AstNodeType.TEXT, value: line.slice(index) });
        break;
      }
      ast.push(paragraph);
      continue;
    }
  }

  return ast;
};

export default parseMarkdown;
