import { assertEquals, assertExists } from "https://deno.land/std@0.210.0/assert/mod.ts";

// Mock DOM Parser for testing HTML generation
class MockDOMParser {
  parseFromString(html: string, mimeType: string) {
    return {
      title: "Test Site Title",
      querySelectorAll: (selector: string) => {
        if (selector === "meta") {
          return [
            {
              hasAttribute: (attr: string) => attr === "property",
              getAttribute: (attr: string) => {
                if (attr === "property") return "og:title";
                if (attr === "content") return "Test Article Title";
                return null;
              }
            },
            {
              hasAttribute: (attr: string) => attr === "property",
              getAttribute: (attr: string) => {
                if (attr === "property") return "og:image";
                if (attr === "content") return "https://example.com/image.jpg";
                return null;
              }
            },
            {
              hasAttribute: (attr: string) => attr === "property",
              getAttribute: (attr: string) => {
                if (attr === "property") return "og:site_name";
                if (attr === "content") return "Example Site";
                return null;
              }
            }
          ];
        }
        return [];
      }
    };
  }
}

// Function to generate linkcard HTML (extracted from plugin logic)
function generateLinkCardHTML(ogData: any, url: string): string {
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

Deno.test("LinkCard Layout Verification", async (t) => {
  await t.step("should generate proper card layout HTML structure", () => {
    const ogData = {
      title: "Test Article",
      siteTitle: "Test Site",
      image: "https://example.com/image.jpg",
      name: "Example Site"
    };
    
    const html = generateLinkCardHTML(ogData, "https://example.com");
    
    // Basic structure checks
    assertEquals(html.includes('<div class="flex flex-grow'), true, "Should have main flex container");
    assertEquals(html.includes('href="https://example.com"'), true, "Should have correct URL link");
    assertEquals(html.includes('title="Link Card"'), true, "Should have Link Card title attribute");
  });

  await t.step("should apply correct TailwindCSS classes for responsive design", () => {
    const ogData = {
      title: "Test Article",
      siteTitle: "Test Site"
    };
    
    const html = generateLinkCardHTML(ogData, "https://example.com");
    
    // TailwindCSS responsive classes
    assertEquals(html.includes("md:!text-base"), true, "Should have responsive text size");
    assertEquals(html.includes("md:max-w-full"), true, "Should have responsive max width");
    assertEquals(html.includes("md:min-w-10"), true, "Should have responsive min width");
    assertEquals(html.includes("hover:bg-gray-100"), true, "Should have hover effects");
  });

  await t.step("should handle image display correctly", () => {
    const ogDataWithImage = {
      title: "Test Article",
      siteTitle: "Test Site",
      image: "https://example.com/image.jpg"
    };
    
    const htmlWithImage = generateLinkCardHTML(ogDataWithImage, "https://example.com");
    assertEquals(htmlWithImage.includes('<img class="object-scale-down basis-4/12'), true, "Should include image with correct classes");
    assertEquals(htmlWithImage.includes('src="https://example.com/image.jpg"'), true, "Should have correct image src");

    const ogDataWithoutImage = {
      title: "Test Article",
      siteTitle: "Test Site"
    };
    
    const htmlWithoutImage = generateLinkCardHTML(ogDataWithoutImage, "https://example.com");
    assertEquals(htmlWithoutImage.includes('<img'), false, "Should not include image when not available");
  });

  await t.step("should handle text overflow with ellipsis", () => {
    const ogData = {
      title: "Very Long Article Title That Should Be Truncated With Ellipsis",
      siteTitle: "Test Site"
    };
    
    const html = generateLinkCardHTML(ogData, "https://example.com");
    
    assertEquals(html.includes("overflow-hidden"), true, "Should have overflow hidden");
    assertEquals(html.includes("text-ellipsis"), true, "Should have text ellipsis");
    assertEquals(html.includes("whitespace-nowrap"), true, "Should prevent text wrapping for domain");
  });

  await t.step("should generate accessible markup", () => {
    const ogData = {
      title: "Test Article",
      siteTitle: "Test Site"
    };
    
    const html = generateLinkCardHTML(ogData, "https://example.com");
    
    assertEquals(html.includes('title="Link Card"'), true, "Should have title attribute for accessibility");
    assertEquals(html.includes('href="https://example.com"'), true, "Should have proper href for navigation");
    assertEquals(html.includes('class="!no-underline'), true, "Should remove default link underline");
  });

  await t.step("should maintain proper aspect ratio and sizing", () => {
    const ogData = {
      title: "Test Article",
      siteTitle: "Test Site",
      image: "https://example.com/image.jpg"
    };
    
    const html = generateLinkCardHTML(ogData, "https://example.com");
    
    assertEquals(html.includes("h-20"), true, "Should have fixed height");
    assertEquals(html.includes("max-w-md"), true, "Should have maximum width constraint");
    assertEquals(html.includes("basis-4/12"), true, "Should have proper image flex basis");
  });
});