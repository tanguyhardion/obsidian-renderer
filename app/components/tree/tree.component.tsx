"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import TreeMenu, { ItemComponent } from "react-simple-tree-menu";
import { Octokit } from "octokit";
import { SpinnerCircularFixed } from "spinners-react";

import downArrowImg from "@icons/down-arrow.png";
import rightArrowImg from "@icons/right-arrow.png";

import styles from "./tree.module.sass";

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
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const files = await getFiles("", []);
    const organizedFilesData = organizeFiles(files);
    setTreeData(organizedFilesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={styles.tree}>
      {loading ? (
        <div className={styles.centered}>
          <SpinnerCircularFixed color="#808080" />
        </div>
      ) : (
        <TreeMenu
          data={treeData}
          onClickItem={({ key, label, ...props }) => {
            if (props.content) {
              onItemSelected({ label: label, content: props.content });
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
      )}
    </div>
  );
}

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
    const filePromises = response.data.map(async (element) => {
      if (element.type === "dir") {
        return getFiles(element.path, elements);
      } else {
        try {
          if (!element.download_url) return;

          let url = element.html_url;
          let encodedUrl = url
            ?.replace(
              "https://github.com/",
              "https://raw.githubusercontent.com/"
            )
            .replace("/blob/", "/");

          const fileContentResponse = await octokit.request(
            "GET " + encodedUrl
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
    });

    await Promise.all(filePromises);
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
