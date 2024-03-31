"use client";

import { useState, useEffect } from "react";
import { Octokit } from "octokit";
import Markdown from "react-markdown";
import wikiLinkPlugin from "remark-wiki-link";

import { isUriEncoded } from "@utils/uri";
import styles from "./navbar.module.sass";

interface NavbarProps {
  children: React.ReactNode;
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

export function Navbar({ children }: NavbarProps) {
  const [organizedFiles, setOrganizedFiles] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const files = await getFiles("", []);
      const organizedFilesData = organizeFiles(files);
      setOrganizedFiles(organizedFilesData);
    };

    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <pre>{JSON.stringify(organizedFiles, null, 2)}</pre>
    </main>
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
  const organizedFiles: Record<string, any> = {};

  files.forEach((file) => {
    const pathParts = file.path.split("/");
    let currentLevel = organizedFiles;

    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        // file if it's the last part of the path
        if (!currentLevel[part]) {
          currentLevel[part] = file.content;
        }
      } else {
        // folder if it's not the last part of the path
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      }
    });
  });

  return organizedFiles;
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
