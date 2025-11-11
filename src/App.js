import React, { useEffect, useRef, useState } from "react";
import "jsoneditor/dist/jsoneditor.css";
import "./App.css";
import JSONEditor from "jsoneditor";
import { createClient } from "@supabase/supabase-js";

import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/mode-json";

const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_KEY = "YOUR-ANON-KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const leftEditor = useRef(null);
  const rightEditor = useRef(null);

  const [json, setJson] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUid, setCurrentUid] = useState(null);

  const generateUid = () => {
    const now = new Date();
    const rand = Math.floor(Math.random() * 10000);
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      "_" +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0") +
      "_" +
      now.getMilliseconds().toString().padStart(3, "0") +
      "_" +
      rand.toString().padStart(4, "0")
    );
  };

  const labelForMode = (m) =>
    m === "view" ? "👁️ View" : m === "tree" ? "🌳 Tree" : m;

  // Load existing JSON if URL contains UID
  useEffect(() => {
    const path = window.location.pathname.split("/")[1];
    if (path) {
      (async () => {
        const { data, error } = await supabase
          .from("json_history")
          .select("json_string")
          .eq("uid", path)
          .single();
        if (!error && data) {
          const parsed = JSON.parse(data.json_string);
          setJson(parsed);
          setCurrentUid(path);
        }
      })();
    } else {
      setJson({
        hello: "world",
        message: "Start editing your JSON here",
      });
    }
  }, []);

  // Initialize editors
  useEffect(() => {
    leftEditor.current = new JSONEditor(leftRef.current, {
      mode: "code",
      mainMenuBar: true,
      search: true,
      onChangeText: (text) => {
        try {
          const parsed = JSON.parse(text);
          setJson(parsed);
          setIsModified(true);
        } catch {}
      },
    });

    const ace = leftEditor.current.aceEditor;
    if (ace) {
      ace.setTheme("ace/theme/one_dark");
      ace.setOptions({ fontSize: 14, wrap: false });
    }

    rightEditor.current = new JSONEditor(rightRef.current, {
      mode: "tree",
      modes: ["tree", "view"],
      mainMenuBar: true,
      search: true,
      onChangeJSON: (data) => {
        setJson(data);
        setIsModified(true);
      },
    });

    // Custom dropdown
    const setupDropdown = () => {
      const modeContainer = rightRef.current?.querySelector(".jsoneditor-modes");
      if (!modeContainer) return;
      modeContainer.innerHTML = "";
      const mode = rightEditor.current.getMode() || "tree";
      const wrap = document.createElement("div");
      wrap.className = "custom-dropdown";
      wrap.innerHTML = `
        <button class="dropdown-toggle">${labelForMode(mode)} ▼</button>
        <div class="dropdown-menu hidden">
          <button data-mode="tree">🌳 Tree</button>
          <button data-mode="view">👁️ View</button>
        </div>
      `;
      modeContainer.appendChild(wrap);

      const toggle = wrap.querySelector(".dropdown-toggle");
      const menu = wrap.querySelector(".dropdown-menu");
      toggle.addEventListener("click", () => menu.classList.toggle("hidden"));
      menu.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          rightEditor.current.setMode(b.dataset.mode);
          requestAnimationFrame(() => setupDropdown());
        })
      );
    };
    requestAnimationFrame(() => setupDropdown());
  }, []);

  // Sync both sides
  useEffect(() => {
    if (!leftEditor.current || !rightEditor.current) return;
    const l = leftEditor.current.get();
    const r = rightEditor.current.get();
    if (JSON.stringify(l) !== JSON.stringify(json)) leftEditor.current.update(json);
    if (JSON.stringify(r) !== JSON.stringify(json)) rightEditor.current.update(json);
  }, [json]);

  // Save JSON to Supabase
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const uid = currentUid || generateUid();
    const jsonString = JSON.stringify(json, null, 2);
    const sizeBytes = new Blob([jsonString]).size;

    const { error } = await supabase.from("json_history").upsert([
      {
        uid,
        title: "Untitled JSON",
        description: "Created via JsonView",
        json_string: jsonString,
        size_bytes: sizeBytes,
      },
    ]);

    if (!error) {
      setCurrentUid(uid);
      setIsModified(false);
      window.history.replaceState({}, "", `/${uid}`);
      alert("✅ Saved successfully!");
    } else {
      console.error(error);
      alert("❌ Failed to save JSON");
    }
    setIsSaving(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied to clipboard!");
  };

  return (
    <div className="App">
      {/* 🔝 Main Toolbar */}
      <header className="top-navbar left-aligned">
        <button className="burger-btn">☰</button>
        <span className="app-name">JsonView</span>

        <div className="nav-actions">
          <button className="nav-btn" onClick={() => window.location.href = "/"}>
            ➕ New
          </button>

          <button
            className={`nav-btn ${isModified ? "active" : ""}`}
            onClick={handleSave}
            disabled={!isModified || isSaving}
          >
            💾 {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            className="nav-btn warning"
            onClick={() => {
              if (window.confirm("Clear all JSON?")) {
                setJson({});
                leftEditor.current.set({});
                rightEditor.current.set({});
                setIsModified(true);
              }
            }}
          >
            ❌ Clear
          </button>

          <button
            className="nav-btn info"
            onClick={() => window.location.reload()}
          >
            🔄 Reset
          </button>

          <button
            className="nav-btn success"
            onClick={handleShare}
            disabled={!currentUid}
          >
            🔗 Share
          </button>
        </div>
      </header>

      {/* JSON Panels */}
      <div className="container">
        <div className="editor-card dark">
          <div className="header-dark">Edit JSON (Code)</div>
          <div ref={leftRef} className="jsoneditor-panel" />
        </div>

        <div className="editor-card dark">
          <div className="header-light">JSON Structure (Tree / View)</div>
          <div ref={rightRef} className="jsoneditor-panel" />
        </div>
      </div>
    </div>
  );
}
