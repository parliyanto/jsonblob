import React, { useEffect, useRef, useState } from "react";
import "jsoneditor/dist/jsoneditor.min.css";
import "../App.css";
import JSONEditor from "jsoneditor/dist/jsoneditor.min.js";

// ✅ Load ace editor secara global
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/ext-searchbox";

console.log("📦 JSONEditor module:", JSONEditor);
console.log("🎬 TreeViewPanel component loaded");
export default function TreeViewPanel({ jsonData = {}, onChange }) {
  const editorContainer = useRef(null);
  const editorRef = useRef(null);
  const [mode, setMode] = useState("tree");

  console.log("=== ready ...");

  useEffect(() => {
    console.log("🔍 useEffect starting...");

    try {
      if (!window.ace) {
        console.log("🌱 Injecting ACE to window...");
        window.ace = ace;
      }

      const editor = new JSONEditor(editorContainer.current, {
        mode: "tree",
        modes: ["tree", "view", "text", "table"],
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
        search: true,
        enableSort: true,
        enableTransform: true,
        onChangeJSON: (data) => onChange?.(data),
      });

      editor.set(jsonData);
      editorRef.current = editor;

      console.log("✅ JSONEditor initialized:", editor);
    } catch (err) {
      console.error("❌ JSONEditor failed to initialize:", err);
    }

    return () => {
      console.log("🧹 Cleaning up JSONEditor...");
      editorRef.current?.destroy();
    };
  }, []);


  useEffect(() => {
    if (editorRef.current) {
      try {
        const current = editorRef.current.get();
        if (JSON.stringify(current) !== JSON.stringify(jsonData)) {
          editorRef.current.update(jsonData);
        }
      } catch {
        /* ignore */
      }
    }
  }, [jsonData]);

  return (
    <div className="editor-card dark">
      <div
        className="header-light"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#2d3139",
          padding: "12px 16px",
          color: "#fff",
        }}
      >
        <span>JSON Structure (tree)</span>
      </div>

      <div ref={editorContainer} className="jsoneditor-panel" />
    </div>
  );
}
