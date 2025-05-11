export const transformImages = {
  resize: [500],
  format: "webp",
};

export function url(page) {
  return `${page.src.path}-500w${page.src.ext}`;
}
