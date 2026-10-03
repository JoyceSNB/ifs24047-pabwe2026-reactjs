import { useState } from "react";
import { toImageUrl, toOptimizedImageUrl } from "../../../helpers/toolsHelper";

// <img> yang memakai versi kecil dari Vercel Image Optimization lebih dulu.
// Jika gagal dimuat (misalnya di localhost), otomatis memakai foto asli.
// optimizedWidth = lebar yang diminta ke pengecil (harus ada di "sizes" vercel.json);
// width/height biasa tetap diteruskan ke <img> sebagai atribut ukuran.
function OptimizedImage({ path, optimizedWidth = 828, alt, ...props }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? toImageUrl(path) : toOptimizedImageUrl(path, optimizedWidth);

  if (!src) return null;

  return <img src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}

export default OptimizedImage;