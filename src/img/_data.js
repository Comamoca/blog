export const transformImages = {
  resize: [200],
  format: "webp",
};

export function url(page) {
  return page.src.entry.path;
}
