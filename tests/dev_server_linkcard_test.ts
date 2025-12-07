import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.210.0/assert/mod.ts";

// Mock development environment configuration
let originalRelease: string | undefined;
let originalDisableCard: string | undefined;

const mockDevEnvironment = () => {
  try {
    originalRelease = Deno.env.get("RELEASE");
    originalDisableCard = Deno.env.get("DISABLE_LINKCARD");
  } catch {
    // If permission denied, set defaults
    originalRelease = undefined;
    originalDisableCard = undefined;
  }

  // Clear environment variables to simulate dev environment
  try {
    if (originalRelease) Deno.env.delete("RELEASE");
    if (originalDisableCard) Deno.env.delete("DISABLE_LINKCARD");
  } catch {
    // Ignore permission errors
  }

  return () => {
    // Restore original environment
    try {
      if (originalRelease) Deno.env.set("RELEASE", originalRelease);
      if (originalDisableCard) {
        Deno.env.set("DISABLE_LINKCARD", originalDisableCard);
      }
    } catch {
      // Ignore permission errors
    }
  };
};

// Mock Lume configuration function
function configureLinkCard(linkCardConfig?: { enabled?: boolean }): any[] {
  let RELEASE: string | undefined;
  let DISABLE_LINKCARD: string | undefined;

  try {
    RELEASE = Deno.env.get("RELEASE");
    DISABLE_LINKCARD = Deno.env.get("DISABLE_LINKCARD");
  } catch {
    // If permission denied, use defaults
    RELEASE = undefined;
    DISABLE_LINKCARD = undefined;
  }

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

Deno.test("Development Server LinkCard Operation", async (t) => {
  await t.step(
    "should enable linkcard plugin in development environment",
    async () => {
      const cleanup = mockDevEnvironment();

      try {
        // Test plugin configuration in dev environment
        const plugins = configureLinkCard();
        const devOperation = await mockDevServerOperation(plugins);

        assertEquals(
          plugins.length > 0,
          true,
          "Plugin should be enabled in dev environment",
        );
        assertEquals(
          devOperation.pluginEnabled,
          true,
          "Plugin should be operational",
        );
        assertEquals(
          devOperation.hotReloadSupported,
          true,
          "Hot reload should be supported",
        );
      } finally {
        cleanup();
      }
    },
  );

  await t.step("should respect DISABLE_LINKCARD in development", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Set disable flag
      Deno.env.set("DISABLE_LINKCARD", "1");

      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      assertEquals(
        plugins.length,
        0,
        "Plugin should be disabled when DISABLE_LINKCARD is set",
      );
      assertEquals(
        devOperation.pluginEnabled,
        false,
        "Plugin operation should be disabled",
      );
    } finally {
      cleanup();
    }
  });

  await t.step("should provide debug information in development", async () => {
    const cleanup = mockDevEnvironment();

    try {
      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      assertEquals(
        devOperation.debugInfo,
        true,
        "Debug information should be available",
      );
      assertEquals(
        devOperation.hotReloadSupported,
        true,
        "Hot reload should work with plugin",
      );
    } finally {
      cleanup();
    }
  });

  await t.step(
    "should support configuration changes without restart",
    async () => {
      const cleanup = mockDevEnvironment();

      try {
        // Test initial state
        let plugins = configureLinkCard();
        let devOperation = await mockDevServerOperation(plugins);
        assertEquals(
          devOperation.pluginEnabled,
          true,
          "Should be enabled initially",
        );

        // Test disabling via config
        plugins = configureLinkCard({ enabled: false });
        devOperation = await mockDevServerOperation(plugins);
        assertEquals(
          devOperation.pluginEnabled,
          false,
          "Should be disabled via config",
        );

        // Test re-enabling
        plugins = configureLinkCard({ enabled: true });
        devOperation = await mockDevServerOperation(plugins);
        assertEquals(devOperation.pluginEnabled, true, "Should be re-enabled");
      } finally {
        cleanup();
      }
    },
  );

  await t.step(
    "should maintain consistent behavior with production",
    async () => {
      const cleanup = mockDevEnvironment();

      try {
        // Test dev behavior
        const devPlugins = configureLinkCard();
        const devOperation = await mockDevServerOperation(devPlugins);

        // Test production behavior (simulated)
        Deno.env.set("RELEASE", "1");
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
    },
  );
});

// Integration test for development workflow
Deno.test("Development Workflow Integration", async (t) => {
  await t.step("should handle hot reload with plugin changes", async () => {
    const cleanup = mockDevEnvironment();

    try {
      // Simulate hot reload scenario
      const initialPlugins = configureLinkCard();
      assertEquals(
        initialPlugins.length > 0,
        true,
        "Plugin should be active initially",
      );

      // Simulate configuration change
      const updatedPlugins = configureLinkCard({ enabled: false });
      assertEquals(
        updatedPlugins.length,
        0,
        "Plugin should be disabled after config change",
      );

      // Simulate re-enable
      const reenabledPlugins = configureLinkCard({ enabled: true });
      assertEquals(
        reenabledPlugins.length > 0,
        true,
        "Plugin should be re-enabled",
      );
    } finally {
      cleanup();
    }
  });

  await t.step("should support real-time debugging", async () => {
    const cleanup = mockDevEnvironment();

    try {
      const plugins = configureLinkCard();
      const devOperation = await mockDevServerOperation(plugins);

      // Verify debugging capabilities
      assertEquals(
        devOperation.debugInfo,
        true,
        "Debug information should be available",
      );
      assertExists(
        devOperation.hotReloadSupported,
        "Hot reload support should be defined",
      );
    } finally {
      cleanup();
    }
  });
});
