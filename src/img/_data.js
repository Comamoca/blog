export const transformImages = {
  resize: [500],
  format: ["webp", "png"], // WebPとPNGの両方を生成（フォールバック用）
};

// 元のPNG形式をフォールバックとして使用
export function url(page) {
  return page.src.path + page.src.ext; // 元の拡張子を維持
}
