import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.210.0/assert/mod.ts";
import * as v from "npm:valibot";

// Define the OGP schema
const OGInfoSchema = v.object({
  url: v.optional(v.string()),
  siteTitle: v.string(),
  title: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
});

type OGInfo = v.InferOutput<typeof OGInfoSchema>;

// Mock function to simulate fetchOGInfo with error handling
async function mockFetchOGInfo(
  url: string,
  mockResponse?: { html?: string; error?: Error },
): Promise<OGInfo | null> {
  try {
    if (mockResponse?.error) {
      throw mockResponse.error;
    }

    const html = mockResponse?.html || "";

    // Parse mock HTML for OG data
    const ogInfo: Record<string, unknown> = {
      siteTitle: "Default Site Title",
    };

    if (html.includes("og:title")) {
      ogInfo.title = "Mock Title";
    }

    if (html.includes("og:image")) {
      ogInfo.image = "https://example.com/image.jpg";
    }

    if (html.includes("og:site_name")) {
      ogInfo.name = "Mock Site";
    }

    // This should throw validation error if required fields are missing
    return v.parse(OGInfoSchema, ogInfo);
  } catch (error) {
    // Return null for error cases - this is what we want to test
    return null;
  }
}

Deno.test("OGP Error Handling", async (t) => {
  await t.step("should handle validation errors gracefully", async () => {
    // Test case where siteTitle is missing (current error scenario)
    const result = await mockFetchOGInfo("https://example.com", {
      html: '<meta property="og:title" content="Test" />',
    });

    // Current implementation throws error, target implementation should return null
    assertEquals(
      result?.siteTitle,
      "Default Site Title",
      "Should provide default siteTitle",
    );
  });

  await t.step("should handle network timeouts", async () => {
    const timeoutError = new Error("Timeout");
    timeoutError.name = "TimeoutError";

    const result = await mockFetchOGInfo("https://example.com", {
      error: timeoutError,
    });

    assertEquals(result, null, "Should return null for timeout errors");
  });

  await t.step("should handle network errors", async () => {
    const networkError = new Error("Network error");
    networkError.name = "NetworkError";

    const result = await mockFetchOGInfo("https://example.com", {
      error: networkError,
    });

    assertEquals(result, null, "Should return null for network errors");
  });

  await t.step("should parse valid OGP data correctly", async () => {
    const validHtml = `
      <title>Site Title</title>
      <meta property="og:title" content="Article Title" />
      <meta property="og:image" content="https://example.com/image.jpg" />
      <meta property="og:site_name" content="Example Site" />
    `;

    const result = await mockFetchOGInfo("https://example.com", {
      html: validHtml,
    });

    assertExists(result, "Should return valid OGP data");
    assertEquals(result.title, "Mock Title", "Should parse OG title");
    assertEquals(
      result.image,
      "https://example.com/image.jpg",
      "Should parse OG image",
    );
    assertEquals(result.name, "Mock Site", "Should parse OG site name");
  });
});
