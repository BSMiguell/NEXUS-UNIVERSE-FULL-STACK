module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm start",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 30000,
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        throttling: {
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        formFactor: "desktop",
        emulatedUserAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36",
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Performance
        "categories:performance": ["warn", { minScore: 0.8 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "speed-index": ["warn", { maxNumericValue: 4300 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],

        // Accessibility
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "color-contrast": ["error", { minScore: 0.9 }],
        "link-name": ["error", { minScore: 1 }],
        "image-alt": ["error", { minScore: 1 }],
        "document-title": ["error", { minScore: 1 }],
        "html-has-lang": ["error", { minScore: 1 }],
        "html-lang-valid": ["error", { minScore: 1 }],
        label: ["error", { minScore: 1 }],

        // Best Practices
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "no-vulnerable-libraries": ["warn", { minScore: 1 }],
        "uses-https": ["error", { minScore: 1 }],
        "uses-passive-event-listeners": ["warn", { minScore: 1 }],

        // SEO
        "categories:seo": ["warn", { minScore: 0.9 }],
        viewport: ["error", { minScore: 1 }],
        "document-title": ["error", { minScore: 1 }],
        "meta-description": ["warn", { minScore: 1 }],
        "http-status-code": ["error", { minScore: 1 }],
        "font-size": ["warn", { minScore: 1 }],

        // PWA (se aplicável)
        "categories:pwa": ["off"], // Desabilitado por padrão
        "service-worker": ["off"],
        "works-offline": ["off"],
        "webapp-install-banner": ["off"],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
