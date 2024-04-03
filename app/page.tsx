"use client";

import { useState } from "react";

import styles from "./page.module.sass";
import { Tree } from "./components/tree/tree.component";
import { Renderer } from "./components/renderer/renderer.component";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState({
    label: "",
    content: "",
  });

  const handleItemSelected = ({
    label,
    content,
  }: {
    label: string;
    content: string;
  }) => {
    setSelectedItem({ label, content });
  };

  return (
    <main className={styles.main}>
      <div className={styles.tree}>
        <Tree onItemSelected={handleItemSelected} />
      </div>
      <div className={styles.renderer}>
        <h1 className={styles.label}>{selectedItem.label}</h1>
        <Renderer content={selectedItem.content} />
      </div>
    </main>
  );
}
