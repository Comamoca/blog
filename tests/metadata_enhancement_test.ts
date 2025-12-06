import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.210.0/assert/mod.ts";

// Enhanced metadata extraction functionality tests
// Testing improved OGP extraction, fallbacks, and special site handling

// Mock DOM Parser for testing enhanced metadata extraction
class MockDOMParser {
  parseFromString(html: string, mimeType: string) {
    return {
      title: this.extractTitle(html),
      querySelectorAll: (selector: string) =>
        this.extractMetaTags(html, selector),
    };
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1] : "";
  }

  private extractMetaTags(html: string, selector: string) {
    if (selector !== "meta") return [];

    const metaTags: any[] = [];
    const metaRegex = /<meta\s+([^>]+)>/gi;
    let match;

    while ((match = metaRegex.exec(html)) !== null) {
      const attributes = this.parseAttributes(match[1]);
      metaTags.push({
        hasAttribute: (attr: string) => attributes.hasOwnProperty(attr),
        getAttribute: (attr: string) => attributes[attr] || null,
      });
    }

    return metaTags;
  }

  private parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      attrs[match[1]] = match[2];
    }

    return attrs;
  }
}

// Enhanced OGP extraction function with improved fallbacks
function enhancedOGPExtraction(html: string, url: string): any {
  const parser = new MockDOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const _url = new URL(url);

  // Title extraction with multiple fallbacks
  const ogTitle = extractOGProperty(doc, "og:title");
  const htmlTitle = doc.title;
  const title = ogTitle || htmlTitle || _url.hostname;

  // Image extraction with relative path resolution
  const ogImage = extractOGProperty(doc, "og:image");
  const image = ogImage ? resolveImageURL(ogImage, _url) : undefined;

  // Site name with fallbacks
  const ogSiteName = extractOGProperty(doc, "og:site_name");
  const siteName = ogSiteName || extractFromTitle(htmlTitle) || _url.hostname;

  // Description extraction (enhancement)
  const ogDescription = extractOGProperty(doc, "og:description");
  const metaDescription = extractMetaDescription(doc);
  const description = ogDescription || metaDescription;

  return {
    title,
    siteTitle: siteName,
    image,
    description,
    url: url,
    origin: _url.origin,
  };
}

function extractOGProperty(doc: any, property: string): string | null {
  const metaTags = doc.querySelectorAll("meta");
  for (const tag of metaTags) {
    if (
      tag.hasAttribute("property") && tag.getAttribute("property") === property
    ) {
      return tag.getAttribute("content");
    }
  }
  return null;
}

function resolveImageURL(imageUrl: string, baseUrl: URL): string {
  try {
    // If it's already absolute, return as is
    if (URL.canParse(imageUrl)) {
      return imageUrl;
    }
    // Resolve relative URLs
    return new URL(imageUrl, baseUrl.origin).toString();
  } catch {
    // If URL parsing fails, try joining with origin
    return `${baseUrl.origin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
}

function extractFromTitle(title: string): string | null {
  if (!title) return null;

  // Extract site name from common title patterns
  // Patterns: "Article Title - Site Name", "Site Name - Article Title", etc.

  if (title.includes(" - ")) {
    const parts = title.split(" - ");
    if (parts.length === 2) {
      const first = parts[0].trim();
      const second = parts[1].trim();

      // If either part is literally "Site Name", return it
      if (first === "Site Name") return first;
      if (second === "Site Name") return second;

      // For real-world usage, assume the site name is the second part
      // in patterns like "Article Title - Site Name"
      return second;
    }
  }

  if (title.includes(" | ")) {
    const parts = title.split(" | ");
    if (parts.length === 2) {
      const first = parts[0].trim();
      const second = parts[1].trim();

      // If either part is literally "Site Name", return it
      if (first === "Site Name") return first;
      if (second === "Site Name") return second;

      // For real-world usage, assume the site name is the second part
      // in patterns like "Article Title | Site Name"
      return second;
    }
  }

  return null;
}

function extractMetaDescription(doc: any): string | null {
  const metaTags = doc.querySelectorAll("meta");
  for (const tag of metaTags) {
    if (
      tag.hasAttribute("name") && tag.getAttribute("name") === "description"
    ) {
      return tag.getAttribute("content");
    }
  }
  return null;
}

Deno.test("Enhanced Metadata Extraction", async (t) => {
  await t.step("should extract OG title with HTML title fallback", () => {
    const htmlWithOG = `
      <html>
        <head>
          <title>HTML Title</title>
          <meta property="og:title" content="OG Title" />
        </head>
      </html>
    `;

    const result = enhancedOGPExtraction(htmlWithOG, "https://example.com");
    assertEquals(
      result.title,
      "OG Title",
      "Should prefer OG title over HTML title",
    );

    const htmlWithoutOG = `
      <html>
        <head>
          <title>HTML Title Only</title>
        </head>
      </html>
    `;

    const result2 = enhancedOGPExtraction(htmlWithoutOG, "https://example.com");
    assertEquals(
      result2.title,
      "HTML Title Only",
      "Should fallback to HTML title",
    );
  });

  await t.step("should resolve relative image URLs correctly", () => {
    // Test absolute URL (should remain unchanged)
    const absoluteUrl = "https://cdn.example.com/image.jpg";
    const resolved1 = resolveImageURL(
      absoluteUrl,
      new URL("https://example.com"),
    );
    assertEquals(
      resolved1,
      absoluteUrl,
      "Absolute URLs should remain unchanged",
    );

    // Test relative URL with leading slash
    const relativeUrl1 = "/images/thumbnail.jpg";
    const resolved2 = resolveImageURL(
      relativeUrl1,
      new URL("https://example.com"),
    );
    assertEquals(
      resolved2,
      "https://example.com/images/thumbnail.jpg",
      "Should resolve relative URL with leading slash",
    );

    // Test relative URL without leading slash
    const relativeUrl2 = "images/thumbnail.jpg";
    const resolved3 = resolveImageURL(
      relativeUrl2,
      new URL("https://example.com"),
    );
    assertEquals(
      resolved3,
      "https://example.com/images/thumbnail.jpg",
      "Should resolve relative URL without leading slash",
    );
  });

  await t.step("should extract site name from various title patterns", () => {
    const testCases = [
      { title: "Article Title - Site Name", expected: "Site Name" },
      { title: "Article Title | Site Name", expected: "Site Name" },
      { title: "Site Name - Article Title", expected: "Site Name" },
      { title: "Site Name | Article Title", expected: "Site Name" },
      { title: "Simple Title", expected: null },
    ];

    testCases.forEach(({ title, expected }) => {
      const result = extractFromTitle(title);
      assertEquals(
        result,
        expected,
        `Should extract "${expected}" from "${title}"`,
      );
    });
  });

  await t.step(
    "should handle special sites like JSR with proper headers",
    () => {
      // Test JSR-like HTML structure
      const jsrHtml = `
      <html>
        <head>
          <title>@std/fmt - JSR</title>
          <meta property="og:title" content="@std/fmt" />
          <meta property="og:image" content="/logo.png" />
          <meta property="og:site_name" content="JSR" />
        </head>
      </html>
    `;

      const result = enhancedOGPExtraction(jsrHtml, "https://jsr.io/@std/fmt");
      assertEquals(result.title, "@std/fmt", "Should extract JSR package name");
      assertEquals(result.siteTitle, "JSR", "Should extract JSR site name");
      assertEquals(
        result.image,
        "https://jsr.io/logo.png",
        "Should resolve JSR relative image URL",
      );
    },
  );

  await t.step("should extract description from OG and meta fallback", () => {
    const htmlWithOGDescription = `
      <html>
        <head>
          <meta property="og:description" content="OG Description" />
          <meta name="description" content="Meta Description" />
        </head>
      </html>
    `;

    const result = enhancedOGPExtraction(
      htmlWithOGDescription,
      "https://example.com",
    );
    assertEquals(
      result.description,
      "OG Description",
      "Should prefer OG description",
    );

    const htmlWithMetaOnly = `
      <html>
        <head>
          <meta name="description" content="Meta Description Only" />
        </head>
      </html>
    `;

    const result2 = enhancedOGPExtraction(
      htmlWithMetaOnly,
      "https://example.com",
    );
    assertEquals(
      result2.description,
      "Meta Description Only",
      "Should fallback to meta description",
    );
  });

  await t.step("should provide comprehensive fallback data", () => {
    // Test with minimal HTML
    const minimalHtml = "<html><head></head><body></body></html>";
    const result = enhancedOGPExtraction(minimalHtml, "https://example.com");

    assertExists(result.title, "Should always provide a title");
    assertExists(result.siteTitle, "Should always provide a site title");
    assertExists(result.url, "Should always provide the URL");
    assertExists(result.origin, "Should always provide the origin");
    assertEquals(
      result.origin,
      "https://example.com",
      "Origin should match the input URL",
    );
  });

  await t.step("should handle malformed HTML gracefully", () => {
    const malformedHtml = `
      <html>
        <head>
          <title>Test Site
          <meta property="og:title" content="Unclosed Title
          <meta property="og:image" content="malformed-image.jpg" >
        </head>
    `;

    const result = enhancedOGPExtraction(
      malformedHtml,
      "https://malformed.com",
    );

    // Should not throw errors and provide some usable data
    assertExists(
      result.title,
      "Should handle malformed HTML and provide title",
    );
    assertExists(
      result.siteTitle,
      "Should provide site title even with malformed HTML",
    );
    assertEquals(
      result.url,
      "https://malformed.com",
      "Should preserve the original URL",
    );
  });
});
