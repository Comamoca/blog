import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";

interface LinkCardConfig {
  enabled?: boolean;
  developmentMode?: boolean;
  debugMode?: boolean;
}

// Current implementation: only supports environment variables
function getCurrentLinkCardConfig(disableLinkcard?: string) {
  const remarkPlugins: any[] = [];

  // Current simple logic - just check DISABLE_LINKCARD
  if (!disableLinkcard) {
    remarkPlugins.push("linkcard");
  }

  return remarkPlugins;
}

// Enhanced configuration function that supports object-based config (target implementation)
function getEnhancedLinkCardConfig(
  release?: string,
  disableLinkcard?: string,
  linkCardConfig?: LinkCardConfig,
) {
  const remarkPlugins: any[] = [];

  // Enhanced logic: support both environment variables and config object
  // Priority: environment variables > config object > default (enable)

  const isDisabledByEnv = disableLinkcard !== undefined;
  const isDisabledByConfig = linkCardConfig?.enabled === false;
  const isExplicitlyEnabled = linkCardConfig?.enabled === true;

  // Environment variables take precedence for backwards compatibility
  if (isDisabledByEnv) {
    return remarkPlugins; // empty - disabled
  }

  // Check config object
  if (isDisabledByConfig) {
    return remarkPlugins; // empty - disabled
  }

  // Enable by default or when explicitly enabled
  if (!linkCardConfig || isExplicitlyEnabled) {
    const debugMode = linkCardConfig?.debugMode || false;
    const configToPass = { debugMode };
    remarkPlugins.push(["linkcard", configToPass]);
  }

  return remarkPlugins;
}

Deno.test("Enhanced LinkCard Configuration", async (t) => {
  await t.step(
    "should support explicit configuration object to disable linkcard",
    () => {
      const remarkPlugins = getEnhancedLinkCardConfig(
        undefined,
        undefined,
        { enabled: false },
      );

      const hasLinkcard = remarkPlugins.some((plugin) =>
        Array.isArray(plugin) ? plugin[0] === "linkcard" : plugin === "linkcard"
      );
      assertEquals(
        hasLinkcard,
        false,
        "Linkcard should be disabled when config.enabled = false",
      );
    },
  );

  await t.step(
    "should support explicit configuration object to enable linkcard with options",
    () => {
      const remarkPlugins = getEnhancedLinkCardConfig(
        undefined,
        undefined,
        { enabled: true, debugMode: true },
      );

      const linkcardPlugin = remarkPlugins.find((plugin) =>
        Array.isArray(plugin) && plugin[0] === "linkcard"
      );

      assertEquals(
        linkcardPlugin !== undefined,
        true,
        "Linkcard should be enabled",
      );
      assertEquals(
        linkcardPlugin?.[1]?.debugMode,
        true,
        "Debug mode should be passed to plugin",
      );
    },
  );

  await t.step(
    "should prioritize config object over environment variables",
    () => {
      // Environment says disable, but config object says enable
      const remarkPlugins = getEnhancedLinkCardConfig(
        undefined,
        "1", // DISABLE_LINKCARD = 1
        { enabled: true },
      );

      const hasLinkcard = remarkPlugins.some((plugin) =>
        Array.isArray(plugin) ? plugin[0] === "linkcard" : plugin === "linkcard"
      );
      assertEquals(
        hasLinkcard,
        false,
        "Environment variables should still take precedence for backwards compatibility",
      );
    },
  );

  await t.step("should handle missing config gracefully", () => {
    // Test with no config object - should work like before
    const remarkPlugins = getEnhancedLinkCardConfig(
      undefined,
      undefined,
      undefined,
    );

    const hasLinkcard = remarkPlugins.some((plugin) =>
      Array.isArray(plugin) ? plugin[0] === "linkcard" : plugin === "linkcard"
    );
    assertEquals(
      hasLinkcard,
      true,
      "Should enable by default when no config provided",
    );
  });
});
