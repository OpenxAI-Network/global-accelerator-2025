// src/components/Code/Preview.jsx
import { useMemo } from 'react';

function buildSrcDoc(html, css, js) {
    const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || html;
    const headContent = html.match(/<head[^>]*>([\s\S]*)<\/head>/)?.[1] || '';
    return `
        <!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />${headContent}<style>${css}</style></head>
        <body>${bodyContent}<script>
            window.onerror = (msg) => parent.postMessage({ type: 'error', msg: msg.toString() }, '*');
            try { ${js} } catch (e) { window.onerror(e.message); }
        </script></body></html>`;
}

// Add refreshKey to the props
export default function Preview({ code, refreshKey }) {
    const srcDoc = useMemo(() => {
        return buildSrcDoc(code.html, code.css, code.js);
    }, [code.html, code.css, code.js]);

    return (
        <div className="preview-container">
            <iframe
                // Use the refreshKey here. When it changes, React unmounts the old iframe and mounts a new one.
                key={refreshKey}
                className="preview-frame"
                srcDoc={srcDoc}
                title="preview"
                sandbox="allow-scripts allow-forms"
            />
        </div>
    );
}