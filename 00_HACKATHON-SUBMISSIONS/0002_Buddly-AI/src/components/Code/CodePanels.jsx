// src/components/Code/CodePanels.jsx
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { material } from '@uiw/codemirror-theme-material';

import Preview from './Preview';
import { downloadCodeAsZip } from '../../utils/zipDownloader';

const TABS = ['preview', 'html', 'css', 'js'];

const extensions = {
    html: [html()],
    css: [css()],
    js: [javascript({ jsx: true })],
};

// Add previewKey to props
export default function CodePanels({ code, onCodeChange, onRefresh, previewKey }) {
    const [activeTab, setActiveTab] = useState('preview');

    const handleCodeChange = (language, value) => {
        onCodeChange({ ...code, [language]: value });
    };

    return (
        <div className="main-app-content">
            <div className="main-app-header">
                <div className="tabs">
                    {TABS.map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="actions">
                    <button onClick={onRefresh}>Refresh Preview</button>
                    <button onClick={() => downloadCodeAsZip(code)}>Download ZIP</button>
                </div>
            </div>

            {/* This is the corrected rendering block */}
            <div className="tab-content">
                <div style={{ display: activeTab === 'preview' ? 'block' : 'none', height: '100%' }}>
                    <Preview code={code} refreshKey={previewKey} />
                </div>
                
                <div style={{ display: activeTab === 'html' ? 'block' : 'none', height: '100%' }}>
                     <CodeMirror
                        value={code.html}
                        height="100%"
                        extensions={extensions.html}
                        onChange={(value) => handleCodeChange('html', value)}
                        theme={material}
                    />
                </div>
                
                <div style={{ display: activeTab === 'css' ? 'block' : 'none', height: '100%' }}>
                     <CodeMirror
                        value={code.css}
                        height="100%"
                        extensions={extensions.css}
                        onChange={(value) => handleCodeChange('css', value)}
                        theme={material}
                    />
                </div>

                <div style={{ display: activeTab === 'js' ? 'block' : 'none', height: '100%' }}>
                     <CodeMirror
                        value={code.js}
                        height="100%"
                        extensions={extensions.js}
                        onChange={(value) => handleCodeChange('js', value)}
                        theme={material}
                    />
                </div>
            </div>
        </div>
    );
}