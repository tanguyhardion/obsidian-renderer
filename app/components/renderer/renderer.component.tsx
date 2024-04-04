import Markdown from "react-markdown";
import wikiLinkPlugin from "remark-wiki-link";

interface RendererProps {
  content: string;
}

export function Renderer({ content }: RendererProps) {
  const regex  = /\[\[(.*?)\|(.*?)\]\]/g;

  // replace `|` used by Obsidian with `:` used by remark-wiki-link
  content = content.replaceAll(regex, "[[$1:$2]]");

  return (
    <Markdown
      remarkPlugins={[
        [
          wikiLinkPlugin,
          {
            hrefTemplate: (link: any) => {
              return `/${link}`;
            },
          },
        ],
      ]}
    >
      {content}
    </Markdown>
  );
}
