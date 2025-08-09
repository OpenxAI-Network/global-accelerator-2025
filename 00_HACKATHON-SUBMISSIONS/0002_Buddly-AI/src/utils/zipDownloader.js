// src/utils/zipDownloader.js
import JSZip from 'jszip';

export async function downloadCodeAsZip(code) {
    const zip = new JSZip();
    zip.file("index.html", code.html);
    zip.file("styles.css", code.css);
    zip.file("app.js", code.js);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lovable-app.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}