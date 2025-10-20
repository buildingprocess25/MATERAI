// Konversi file ke base64 data URL untuk pratinjau dan pengiriman
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.onload = () => {
      const dataUrl = reader.result; // data:<mime>;base64,XXXX
      const [, meta, base64] =
        String(dataUrl).match(/^data:(.*?);base64,(.*)$/) || [];
      const extension = (file.name.split(".").pop() || "").toLowerCase();
      resolve({
        dataUrl,
        base64,
        mimeType: meta || file.type,
        extension,
        size: file.size,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  });
}
