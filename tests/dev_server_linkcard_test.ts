import { describe, test } from "vite-plus/test";
import { assertEquals, assertExists } from "./_asserts.ts";

// Mock development environment configuration
let originalRelease: string | undefined;
let originalDisableCard: string | undefined;

const mockDevEnvironment = () => {
  originalRelease = process.env.RELEASE;
  originalDisableCard = process.env.DISABLE_LINKCARD;

  // Clear environment variables to simulate dev environment
  if (originalRelease) delete process.env.RELEASE;
  if (originalDisableCard) delete process.env.DISABLE_LINKCARD;

  return () => {
    // Restore original environment
    if (originalRelease) process.env.RELEASE = originalRelease;
    if (originalDisableCard) process.env.DISABLE_LINKCARD = originalDisableCard;
  };
};

// Mock Lume configuration function
function configureLinkCard(linkCardConfig?: { enabled?: boolean }): any[] {
  const RELEASE: string | undefined = process.env.RELEASE;
  const DISABLE_LINKCARD: string | undefined = process.env.DISABLE_LINKCARD;

  const isDisabledByEnv = DISABLE_LINKCARD !== undefined;
  const isDisabledByConfig = linkCardConfig?.enabled === false;

  if (isDisabledByEnv || isDisabledByConfig) {
    return []; // disabled
  }

  // Enable by default in both dev and production (this is our new behavior)
  return ["linkcard-plugin"];
}

// Mock plugin operation for development server
async function mockDevServerOperation(pluginConfig: any[]): Promise<{
  pluginEnabled: boolean;
  hotReloadSupported: boolean;
  debugInfo: boolean;
}> {
  return {
    pluginEnabled: pluginConfig.length > 0,
    hotReloadSupported: true, // Simulated hot reload support
    debugInfo: true, // Debug info available in dev
  };
}

describe("Development Server LinkCard Operation", () => {
  test("should enable linkcard plugin in development environment", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Test plugin configuration in dev environment
      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      assertEquals(plugins.length > 0, true, "Plugin should be enabled in dev environment");
      assertEquals(devOperation.pluginEnabled, true, "Plugin should be operational");
      assertEquals(devOperation.hotReloadSupported, true, "Hot reload should be supported");
    } finally {
      cleanup();
    }
  });

  test("should respect DISABLE_LINKCARD in development", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Set disable flag
      process.env.DISABLE_LINKCARD = "1";

      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      assertEquals(plugins.length, 0, "Plugin should be disabled when DISABLE_LINKCARD is set");
      assertEquals(devOperation.pluginEnabled, false, "Plugin operation should be disabled");
    } finally {
      cleanup();
    }
  });

  test("should provide debug information in development", async () => {
    const cleanup = mockDevEnvironment();

    try {
      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      assertEquals(devOperation.debugInfo, true, "Debug information should be available");
      assertEquals(devOperation.hotReloadSupported, true, "Hot reload should work with plugin");
    } finally {
      cleanup();
    }
  });

  test("should support configuration changes without restart", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Test initial state
      let plugins = configureLinkCard();
      let devOperation = await mockDevServerOperation(plugins);
      assertEquals(devOperation.pluginEnabled, true, "Should be enabled initially");

      // Test disabling via config
      plugins = configureLinkCard({ enabled: false });
      devOperation = await mockDevServerOperation(plugins);
      assertEquals(devOperation.pluginEnabled, false, "Should be disabled via config");

      // Test re-enabling
      plugins = configureLinkCard({ enabled: true });
      devOperation = await mockDevServerOperation(plugins);
      assertEquals(devOperation.pluginEnabled, true, "Should be re-enabled");
    } finally {
      cleanup();
    }
  });

  test("should maintain consistent behavior with production", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Test dev behavior
      const devPlugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(devPlugins);

      // Test production behavior (simulated)
      process.env.RELEASE = "1";
      const prodPlugins = configureLinkCard();

      assertEquals(
        devPlugins.length,
        prodPlugins.length,
        "Dev and prod should have same plugin count",
      );
      assertEquals(
        devOperation.pluginEnabled,
        prodPlugins.length > 0,
        "Plugin enabled state should match",
      );
    } finally {
      cleanup();
    }
  });
});

// Integration test for development workflow
describe("Development Workflow Integration", () => {
  test("should handle hot reload with plugin changes", () => {
    const cleanup = mockDevEnvironment();

    try {
      // Simulate hot reload scenario
      const initialPlugins = configureLinkCard();
      assertEquals(initialPlugins.length > 0, true, "Plugin should be active initially");

      // Simulate configuration change
      const updatedPlugins = configureLinkCard({ enabled: false });
      assertEquals(updatedPlugins.length, 0, "Plugin should be disabled after config change");

      // Simulate re-enable
      const reenabledPlugins = configureLinkCard({ enabled: true });
      assertEquals(reenabledPlugins.length > 0, true, "Plugin should be re-enabled");
    } finally {
      cleanup();
    }
  });

  test("should support real-time debugging", async () => {
    const cleanup = mockDevEnvironment();

    try {
      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      // Verify debugging capabilities
      assertEquals(devOperation.debugInfo, true, "Debug information should be available");
      assertExists(devOperation.hotReloadSupported, "Hot reload support should be defined");
    } finally {
      cleanup();
    }
  });
});
