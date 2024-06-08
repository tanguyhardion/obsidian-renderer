import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import wikiLinkPlugin from "remark-wiki-link";

import { Timeline } from "../timeline/timeline.component";

interface RendererProps {
  content: string;
}

export function Renderer({ content }: RendererProps) {
  /* Timeline */

  const timelineRegex = /```timeline-labeled([^`]*)```/;
  const timelineMatch = content.match(timelineRegex);

  let timelineContent = "";
  if (timelineMatch) {
    timelineContent = timelineMatch[1].trim();
    content = content.replace(timelineRegex, "||timeline||");
  }

  /* Links */

  const linkRegex = /\[\[(.*?)\|(.*?)\]\]/g;

  // replace `|` used by Obsidian with `:` used by remark-wiki-link
  content = content.replaceAll(linkRegex, "[[$1:$2]]");

  // handle line breaks in markdown
  content = content.replaceAll("\n", "  \n");

  const handleLinkClick = (event: any, href: string | undefined) => {
    event.preventDefault();
    if (href) {
    }
  };

  return (
    <Markdown
      components={{
        a: ({ href, children, ...props }) => (
          <a href={href} onClick={(event) => handleLinkClick(event, href)}>
            {children}
          </a>
        ),
        // Render Timeline component in place of the placeholder
        p: ({ node, children }) => {
          if (
            node &&
            node.children &&
            node.children[0] &&
            node.children[0].type === "text" &&
            node.children[0].value === "||timeline||"
          ) {
            return <Timeline inputText={timelineContent} />;
          }
          return <p>{children}</p>;
        },
      }}
      remarkPlugins={[
        [
          wikiLinkPlugin,
          {
            hrefTemplate: (link: any) => {
              return `/${link}`;
            },
          },
        ],
        remarkGfm,
      ]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </Markdown>
  );
}
