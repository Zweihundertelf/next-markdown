import { markdownToHtml } from './md';
import parseMarkdown from './parseMarkdown';

const Markdown = ({ code }: { code: string }) => {
  const markdown = String(code);
  return markdownToHtml(parseMarkdown(markdown));
};

export default Markdown;
