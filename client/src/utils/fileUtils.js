export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function processFile(file, basePath = "") {
  const buffer = await readFileAsArrayBuffer(file);
  const base64Content = arrayBufferToBase64(buffer);
  const relativePath = basePath
    ? `${basePath}/${file.webkitRelativePath || file.name}`.replace(/\/+/g, "/")
    : file.webkitRelativePath || file.name;
  return {
    path: relativePath,
    content: base64Content,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

export async function processFileList(fileList, stripTopFolder = true) {
  const files = Array.from(fileList);
  const processed = [];
  for (const file of files) {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const base64Content = arrayBufferToBase64(buffer);
      let relativePath = file.webkitRelativePath || file.name;
      if (stripTopFolder && relativePath.includes("/")) {
        relativePath = relativePath.substring(relativePath.indexOf("/") + 1);
      }
      if (relativePath) {
        processed.push({
          path: relativePath,
          content: base64Content,
          name: file.name,
          size: file.size,
        });
      }
    } catch {
      console.error(`Failed to process file: ${file.name}`);
    }
  }
  return processed;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const iconMap = {
    js: "🟨",
    jsx: "⚛️",
    ts: "🔷",
    tsx: "⚛️",
    py: "🐍",
    html: "🌐",
    css: "🎨",
    json: "📋",
    md: "📝",
    txt: "📄",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    gif: "🖼️",
    svg: "🎭",
    pdf: "📕",
    zip: "📦",
    sh: "⚙️",
    yaml: "⚙️",
    yml: "⚙️",
    env: "🔐",
    gitignore: "🚫",
  };
  return iconMap[ext] || "📄";
}