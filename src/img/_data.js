export const transformImages = {
  resize: [500],
  format: "webp",
};

export function url(page) {
  return page.src.entry.path;
}
