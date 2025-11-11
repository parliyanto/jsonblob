import React from 'react';

export default function StatusBar({ raw, valid, lastSavedSlot, lastSavedAt }) {
  const lines = raw.split('\n').length;
  const chars = raw.length;
  return (
    <div className="statusbar">
      <div>
        <span className={valid ? 'ok' : 'err'}>
          {valid ? '● Valid JSON' : '● Invalid JSON'}
        </span>
        {'  '}·{'  '}
        <span>Lines: <code>{lines}</code></span>
        {'  '}·{'  '}
        <span>Chars: <code>{chars}</code></span>
      </div>
      <div>
        {lastSavedSlot ? (
          <span>Last saved: <code>{lastSavedSlot}</code>{lastSavedAt ? ` @ ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}</span>
        ) : <span>Not saved</span>}
      </div>
    </div>
  );
}
