import { afterEach, beforeEach, describe, test } from "vite-plus/test";
import { assertEquals } from "./_asserts.ts";

// Environment state management for testing
let originalRelease: string | undefined;
let originalDisableLinkcard: string | undefined;

const environmentState = {
  original: {
    RELEASE: "",
    DISABLE_LINKCARD: "",
  },

  initialize() {
    originalRelease = process.env.RELEASE;
    originalDisableLinkcard = process.env.DISABLE_LINKCARD;
    this.original.RELEASE = originalRelease || "";
    this.original.DISABLE_LINKCARD = originalDisableLinkcard || "";
  },

  setDevelopment() {
    if (this.original.RELEASE) delete process.env.RELEASE;
    if (this.original.DISABLE_LINKCARD) delete process.env.DISABLE_LINKCARD;
  },

  setProduction() {
    process.env.RELEASE = "1";
    if (this.original.DISABLE_LINKCARD) delete process.env.DISABLE_LINKCARD;
  },

  restore() {
    // Restore original environment
    if (originalRelease) {
      process.env.RELEASE = originalRelease;
    } else {
      delete process.env.RELEASE;
    }

    if (originalDisableLinkcard) {
      process.env.DISABLE_LINKCARD = originalDisableLinkcard;
    } else {
      delete process.env.DISABLE_LINKCARD;
    }
  },
};

// Mock configuration function matching real implementation
function configureLinkCard(linkCardConfig?: { enabled?: boolean }): any[] {
  const RELEASE: string | undefined = process.env.RELEASE;
  const DISABLE_LINKCARD: string | undefined = process.env.DISABLE_LINKCARD;

  const isDisabledByEnv = DISABLE_LINKCARD !== undefined;
  const isDisabledByConfig = linkCardConfig?.enabled === false;

  if (isDisabledByEnv || isDisabledByConfig) {
    return [];
  }

  return ["linkcard"];
}

// Mock HTML generation that should be consistent across environments
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

describe("Environment Consistency Verification", () => {
  beforeEach(() => {
    environmentState.initialize();
  });

  afterEach(() => {
    environmentState.restore();
  });

  test("should have identical HTML structure across environments", () => {
    const testData = {
      title: "Consistency Test Article",
      siteTitle: "Test Site",
      image: "https://example.com/test.jpg",
    };
    const testURL = "https://consistency-test.com";

    try {
      // Generate HTML in development environment
      environmentState.setDevelopment();
      const devHTML = generateLinkCardHTML(testData, testURL);

      // Generate HTML in production environment
      environmentState.setProduction();
      const prodHTML = generateLinkCardHTML(testData, testURL);

      // Verify identical structure
      assertEquals(devHTML, prodHTML, "HTML structure must be identical across environments");
      assertEquals(devHTML.includes("flex flex-grow"), true, "Layout classes should be consistent");
      assertEquals(
        prodHTML.includes("flex flex-grow"),
        true,
        "Layout classes should be consistent",
      );
    } finally {
      environmentState.restore();
    }
  });

  test("should maintain consistent TailwindCSS classes", () => {
    const testData = { title: "CSS Test", siteTitle: "Test" };

    try {
      environmentState.setDevelopment();
      const devHTML = generateLinkCardHTML(testData, "https://css-test.com");

      environmentState.setProduction();
      const prodHTML = generateLinkCardHTML(testData, "https://css-test.com");

      // Check specific responsive classes (common to all linkcards)
      const responsiveClasses = ["md:!text-base", "md:max-w-full", "md:min-w-10"];

      responsiveClasses.forEach((className) => {
        assertEquals(devHTML.includes(className), true, `Dev should include ${className}`);
        assertEquals(prodHTML.includes(className), true, `Prod should include ${className}`);
        assertEquals(
          devHTML.includes(className),
          prodHTML.includes(className),
          `${className} consistency between environments`,
        );
      });
    } finally {
      environmentState.restore();
    }
  });

  test("should have consistent plugin configuration", () => {
    try {
      // Test development environment
      environmentState.setDevelopment();
      const devPlugins = configureLinkCard();

      // Test production environment
      environmentState.setProduction();
      const prodPlugins = configureLinkCard();

      // Both environments should enable the plugin by default
      assertEquals(devPlugins.length > 0, true, "Dev should enable plugin");
      assertEquals(prodPlugins.length > 0, true, "Prod should enable plugin");
      assertEquals(devPlugins.length, prodPlugins.length, "Plugin count should match");
    } finally {
      environmentState.restore();
    }
  });

  test("should respect disable flag consistently", () => {
    try {
      // Test development with disable flag
      environmentState.setDevelopment();
      process.env.DISABLE_LINKCARD = "1";
      const devDisabled = configureLinkCard();

      // Test production with disable flag
      environmentState.setProduction();
      process.env.DISABLE_LINKCARD = "1";
      const prodDisabled = configureLinkCard();

      assertEquals(devDisabled.length, 0, "Dev should respect disable flag");
      assertEquals(prodDisabled.length, 0, "Prod should respect disable flag");
      assertEquals(
        devDisabled.length,
        prodDisabled.length,
        "Disable behavior should be consistent",
      );
    } finally {
      environmentState.restore();
    }
  });

  test("should maintain consistent image handling", () => {
    const testCases = [
      { title: "With Image", image: "https://example.com/image.jpg" },
      { title: "Without Image" },
    ];

    testCases.forEach((testData) => {
      try {
        environmentState.setDevelopment();
        const devHTML = generateLinkCardHTML(testData, "https://image-test.com");

        environmentState.setProduction();
        const prodHTML = generateLinkCardHTML(testData, "https://image-test.com");

        assertEquals(
          devHTML,
          prodHTML,
          `Image handling should be consistent for: ${testData.title}`,
        );

        const hasImage = testData.image !== undefined;
        assertEquals(
          devHTML.includes("<img"),
          hasImage,
          `Dev image presence should match data for: ${testData.title}`,
        );
        assertEquals(
          prodHTML.includes("<img"),
          hasImage,
          `Prod image presence should match data for: ${testData.title}`,
        );
      } finally {
        environmentState.restore();
      }
    });
  });

  test("should provide consistent accessibility features", () => {
    const testData = { title: "Accessibility Test", siteTitle: "Test Site" };

    try {
      environmentState.setDevelopment();
      const devHTML = generateLinkCardHTML(testData, "https://a11y-test.com");

      environmentState.setProduction();
      const prodHTML = generateLinkCardHTML(testData, "https://a11y-test.com");

      // Accessibility features that must be consistent
      const a11yFeatures = ['title="Link Card"', 'href="https://a11y-test.com"', "!no-underline"];

      a11yFeatures.forEach((feature) => {
        assertEquals(
          devHTML.includes(feature),
          true,
          `Dev should include a11y feature: ${feature}`,
        );
        assertEquals(
          prodHTML.includes(feature),
          true,
          `Prod should include a11y feature: ${feature}`,
        );
      });
    } finally {
      environmentState.restore();
    }
  });
});
