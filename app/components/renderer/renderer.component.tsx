import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import wikiLinkPlugin from "remark-wiki-link";

interface RendererProps {
  content: string;
}

export function Renderer({ content }: RendererProps) {
  const regex = /\[\[(.*?)\|(.*?)\]\]/g;

  // replace `|` used by Obsidian with `:` used by remark-wiki-link
  content = content.replaceAll(regex, "[[$1:$2]]");

  // handle line breaks in markdown
  content = content.replaceAll("\n", "  \n");

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
        remarkGfm,
      ]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </Markdown>
  );
}
