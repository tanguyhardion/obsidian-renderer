"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import TreeMenu, { ItemComponent } from "react-simple-tree-menu";
import { Octokit } from "octokit";

import { isUriEncoded } from "@utils/uri";
import downArrowImg from "@icons/down-arrow.png";
import rightArrowImg from "@icons/right-arrow.png";

interface TreeProps {
  onItemSelected: ({
    label,
    content,
  }: {
    label: string;
    content: string;
  }) => void;
}

interface GitFile {
  type: "dir" | "file" | "submodule" | "symlink";
  size: number;
  name: string;
  path: string;
  content?: string | undefined;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
  };
}

export function Tree({ onItemSelected }: TreeProps) {
  const downArrow = <Image src={downArrowImg} alt="-" />;
  const rightArrow = <Image src={rightArrowImg} alt="+" />;

  const [treeData, setTreeData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const files = await getFiles("", []);
      const organizedFilesData = organizeFiles(files);
      setTreeData(organizedFilesData);
    };

    fetchData();
  }, []);

  return (
    <main>
      <TreeMenu
        data={treeData}
        onClickItem={({ key, label, ...props }) => {
          if (props.content) {
            onItemSelected({ label: label, content: props.content });
            /* openNodes.includes(key)
              ? openNodes.splice(openNodes.indexOf(key), 1)
              : openNodes.push(key); */
          }
        }}
      >
        {({ items }) => (
          <ul className="tree-item-group">
            {items.map(({ key, ...props }) => (
              <ItemComponent
                key={key}
                {...props}
                openedIcon={downArrow}
                closedIcon={rightArrow}
              />
            ))}
          </ul>
        )}
      </TreeMenu>
    </main>
  );
}

/*
<div key={key}>
  {props.content ? (
    <Link key={key} href={`/${key}`}>
      <ItemComponent
        key={key}
        {...props}
        openedIcon={downArrow}
        closedIcon={rightArrow}
      />
    </Link>
  ) : (
    <ItemComponent
      key={key}
      {...props}
      openedIcon={downArrow}
      closedIcon={rightArrow}
    />
  )}
</div>
*/

async function getFiles(path: string, elements: GitFile[]): Promise<GitFile[]> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "tanguyhardion",
      repo: "pe-ia-p24",
      path: path,
    }
  );

  if (Array.isArray(response.data)) {
    for (const element of response.data) {
      if (element.type === "dir") {
        await getFiles(element.path, elements);
      } else {
        try {
          if (!element.download_url) continue;

          if (!isUriEncoded(element.download_url)) {
            element.download_url = encodeURI(element.download_url);
          }

          const fileContentResponse = await octokit.request(
            "GET " + element.download_url
          );

          if (fileContentResponse.data && element.name.endsWith(".md")) {
            elements.push({
              ...element,
              path: element.path,
              content: fileContentResponse.data,
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  return elements;
}

function organizeFiles(files: GitFile[]): Record<string, any> {
  const treeData: Record<string, any> = {};

  files.forEach((file) => {
    const pathParts = file.path.split("/");
    let currentLevel = treeData;

    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {
          label: part.replace(".md", ""),
          index,
          nodes: {},
        };
      }

      if (index === pathParts.length - 1) {
        // file if it's the last part of the path
        currentLevel[part].content = file.content;
      } else {
        // folder if it's not the last part of the path
        currentLevel = currentLevel[part].nodes;
      }
    });
  });

  return treeData;
}

/* <div key={index}>
  <h2>{folderName}</h2>
  {files.map((file, fileIndex) => (
    <div key={index}>
      <h3>{file.name.replace(".md", "")}</h3>
      <Markdown
        key={fileIndex}
        remarkPlugins={[
          [
            wikiLinkPlugin,
            {
              hrefTemplate: (link: any) => {
                return `/${folderName}/${link}`;
              },
            },
          ],
        ]}
      >
        {file.content}
      </Markdown>
    </div>
  ))}
</div> */
