import React, { useRef } from 'react';

export default function Toolbar({
  onBeautify, onCompact, onSort, onValidate,
  onSaveNamed, onLoadNamed, slots, activeSlot, setActiveSlot,
  onDownload, onUploadFile
}) {
  const fileRef = useRef(null);

  return (
    <div className="toolbar">
      <div className="group">
        <button className="primary" onClick={() => onSaveNamed(activeSlot || 'default')}>Save</button>
        <select
          value={activeSlot || ''}
          onChange={(e) => setActiveSlot(e.target.value)}
          title="Select save slot"
        >
          {slots.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => onLoadNamed(activeSlot || 'default')}>Load</button>
        <button onClick={onDownload}>Download</button>
        <button onClick={() => fileRef.current?.click()}>Upload</button>
        <input
          ref={fileRef}
          type="file" accept=".json,application/json" style={{ display: 'none' }}
          onChange={(e) => onUploadFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="group">
        <button onClick={onBeautify}>Beautify</button>
        <button onClick={onCompact}>Compact</button>
        <button onClick={onSort}>Sort keys</button>
        <button onClick={onValidate}>Validate</button>
      </div>
    </div>
  );
}
