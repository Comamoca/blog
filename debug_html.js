// デバッグ用：実際のHTML出力を確認
function generateLinkCardHTML(ogData, url) {
  const title = ogData.title || ogData.siteTitle;
  const name = new URL(url).origin;
  const image = ogData.image 
    ? `<img class="object-scale-down basis-4/12 rounded-tr-lg rounded-br-lg h-full m-0 md:!mt-0" src="${ogData.image}" />`
    : "";

  return `
    <div class="flex flex-grow border(t gray-200) w-full h-20 max-w-md md:min-w-10">
      <a
        href="${url}"
        class="!no-underline flex w-full bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-100"
        title="Link Card"
      >
        <div class="flex grow flex-col">
          <span class="!text-xs md:!text-base px-3 pt-2 py-0 h-20 !mt-0 !mb-0 font-bold tracking-tight text-gray-900 overflow-hidden text-ellipsis">
            ${title}
          </span>
          <span class="font-xs px-3 pb-3 !mb-0 text-gray-700 text-sm max-w-48 md:max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
            ${name}
          </span>
        </div>
        ${image}
      </a>
    </div>
     `;
}

const ogData = {
  title: "Test Article",
  siteTitle: "Test Site",
  image: "https://example.com/image.jpg",
  name: "Example Site"
};

const html = generateLinkCardHTML(ogData, "https://example.com");
console.log("Generated HTML:");
console.log(html);
console.log("\nChecking specific assertions:");
console.log("Has main flex container:", html.includes('<div class="flex flex-grow'));
console.log("Has correct URL link:", html.includes('<a href="https://example.com"'));
console.log("Has title attribute:", html.includes('title="Link Card"'));
