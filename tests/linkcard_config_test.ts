import { describe, test } from "vite-plus/test";
import { assertEquals } from "./_asserts.ts";

// Helper function to test linkcard plugin configuration
function getLinkCardPluginConfig(_release?: string, disableLinkcard?: string) {
  const remarkPlugins: any[] = [];

  // New logic: enable by default unless explicitly disabled
  const isDisabled = disableLinkcard !== undefined;

  if (!isDisabled) {
    remarkPlugins.push("linkcard");
  }

  return remarkPlugins;
}

describe("LinkCard Configuration - Environment-based control", () => {
  test("should enable linkcard plugin in development environment by default", () => {
    // Test development environment (no RELEASE env var)
    const remarkPlugins = getLinkCardPluginConfig(undefined, undefined);

    const hasLinkcard = remarkPlugins.includes("linkcard");
    assertEquals(hasLinkcard, true, "Linkcard plugin should be enabled in development environment");
  });

  test("should enable linkcard plugin in production environment", () => {
    // Test production environment (RELEASE env var set)
    const remarkPlugins = getLinkCardPluginConfig("1", undefined);

    const hasLinkcard = remarkPlugins.includes("linkcard");
    assertEquals(hasLinkcard, true, "Linkcard plugin should be enabled in production environment");
  });

  test("should allow disabling linkcard with DISABLE_LINKCARD environment variable", () => {
    // Test explicit disable in production
    const remarkPluginsProduction = getLinkCardPluginConfig("1", "1");
    const hasLinkcardProduction = remarkPluginsProduction.includes("linkcard");
    assertEquals(
      hasLinkcardProduction,
      false,
      "Linkcard plugin should be disabled when DISABLE_LINKCARD is set in production",
    );

    // Test explicit disable in development
    const remarkPluginsDevelopment = getLinkCardPluginConfig(undefined, "1");
    const hasLinkcardDevelopment = remarkPluginsDevelopment.includes("linkcard");
    assertEquals(
      hasLinkcardDevelopment,
      false,
      "Linkcard plugin should be disabled when DISABLE_LINKCARD is set in development",
    );
  });
});
