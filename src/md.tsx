import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { AstNodeType } from './parseMarkdown';

// TODO EDIT ANY
const components: Record<string, any> = {
  break: () => <br />,
  thematic_break: () => <hr />,
  h1: ({ ...props }) => <h1 {...props} />,
  h2: ({ ...props }) => <h2 {...props} />,
  h3: ({ ...props }) => <h3 {...props} />,
  h4: ({ ...props }) => <h4 {...props} />,
  h5: ({ ...props }) => <h5 {...props} />,
  h6: ({ ...props }) => <h6 {...props} />,
  div: ({ ...props }) => <div {...props} />,
  paragraph: ({ ...props }) => <p {...props} />,
  span: ({ ...props }) => <span {...props} />,
  anchor: ({ ...props }) => <a {...props} />,
  link: ({ ...props }) => <Link href={props.href} {...props} />,
  strong: ({ ...props }) => <strong {...props} />,
  italic: ({ ...props }) => <i {...props} />,
  strikethrough: ({ ...props }) => <s {...props} />,
  image: ({ ...props }) => <Image src={props.src} alt={props.alt} height={props.height} width={props.width} {...props} />,
  code: ({ ...props }) => (
    <pre>
      <code {...props} />
    </pre>
  ),
};

export const markdownToHtml = (elements: any) => {
  return elements.map((element: any, index: number) => {
    switch (element.type) {
      case AstNodeType.BREAK:
        const Break = components['break'];
        return <Break />;
      case AstNodeType.THEMATIC_BREAK:
        const ThematicBreak = components['thematic_break'];
        return <ThematicBreak />;
      case AstNodeType.HEADING:
        const Heading = components['h' + element.children[0].value];
        return <Heading key={index}>{element.value}</Heading>;
      case AstNodeType.CODE:
        const Code = components['code'];
        return <Code key={index}>{element.value}</Code>;
      case AstNodeType.PARAGRAPH:
        const Paragraph = components['paragraph'];
        return (
          <Paragraph key={index}>
            {element.children.map((child: any, childIndex: number) => {
              if (child.type === AstNodeType.IMAGE) {
                // const Image = components['image'];
                return <Image key={childIndex} src={child.value} alt={child.children[0].value || 'image'} height={300} width={300} />;
              }
              if (child.type === AstNodeType.ANCHOR) {
                if (child.onPage) {
                  const Link = components['link'];
                  return (
                    <Link key={childIndex} href={child.value} rel="noopener noreferrer">
                      {child.children[0].value}
                    </Link>
                  );
                } else {
                  const Anchor = components['anchor'];
                  return (
                    <Anchor key={childIndex} href={child.value} target={child.target} rel="noopener noreferrer">
                      {child.children[0].value}
                    </Anchor>
                  );
                }
              }
              if (child.type === AstNodeType.STRONG) {
                const Strong = components['strong'];
                return <Strong key={childIndex}>{child.value}</Strong>;
              }
              if (child.type === AstNodeType.ITALIC) {
                const Italic = components['italic'];
                return <Italic key={childIndex}>{child.value}</Italic>;
              }
              if (child.type === AstNodeType.STRIKETHROUGH) {
                const Strikethrough = components['strikethrough'];
                return <Strikethrough key={childIndex}>{child.value}</Strikethrough>;
              }
              const Span = components['span'];
              return <Span key={childIndex}>{child.value}</Span>;
            })}
          </Paragraph>
        );
      default:
        return;
    }
  });
};
