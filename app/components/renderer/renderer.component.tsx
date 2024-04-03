import Markdown from "react-markdown";
import wikiLinkPlugin from "remark-wiki-link";

interface RendererProps {
  content: string;
}

export function Renderer({ content }: RendererProps) {
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
