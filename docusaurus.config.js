// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Code themes matched to the brand palette (Ink & Violet): flat surfaces that
// sit on the page instead of the stock GitHub / Dracula colours.
const codeThemeLight = {
  ...prismThemes.github,
  plain: {color: '#0E1116', backgroundColor: '#F6F7F9'},
};
const codeThemeDark = {
  ...prismThemes.vsDark,
  plain: {color: '#E8EAED', backgroundColor: '#11141B'},
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'eSIMfly Business API',
  tagline: 'Deliver eSIM data packages via the eSIMfly HTTPS API',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: false,
  },

  // Set the production url of your site here
  url: 'https://docs.esimfly.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'esimfly', // Usually your GitHub org/user name.
  projectName: 'api-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Brand typography: IBM Plex Sans (text) + IBM Plex Mono (code)
  headTags: [
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
  ],

  // Import static/llm/*.txt as plain strings so the AI prompts are a single
  // source of truth: served raw at /llm/<id>.txt AND rendered in the docs.
  plugins: [
    function llmPromptsAsSource() {
      return {
        name: 'llm-prompts-as-source',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /[\\/]static[\\/]llm[\\/][^\\/]+\.txt$/,
                  type: 'asset/source',
                },
              ],
            },
          };
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // No "Edit this page" links: the template default pointed every page at
          // the Docusaurus repository.
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Light first (the brand palette is ink on white); follow the visitor's
      // system setting, and the toggle still works.
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      // Link preview card built from the brand kit (logo, IBM Plex Sans, palette)
      image: 'img/esimfly-docs-card.png',
      navbar: {
        title: 'Business API',
        logo: {
          alt: 'eSIMfly Logo',
          src: 'https://esimfly.net/images/logo-blue.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'API Documentation',
          },
          {
            href: 'https://esimfly.net/business-dashboard',
            label: 'Dashboard',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        logo: {
          alt: 'eSIMfly',
          src: 'https://esimfly.net/images/logo-blue.svg',
          height: 26,
        },
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
              {
                label: 'API Reference',
                to: '/docs/api/balance',
              },
              {
                label: 'Authentication',
                to: '/docs/api-authentication',
              },
              {
                label: 'AI / LLM Integration',
                to: '/docs/llm-integration',
              },
              {
                label: 'Node.js SDK (npm)',
                href: 'https://www.npmjs.com/package/@esimfly/sdk',
              },
              {
                label: 'MCP Server (npm)',
                href: 'https://www.npmjs.com/package/@esimfly/mcp',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Business Dashboard',
                href: 'https://esimfly.net/business-dashboard',
              },
              {
                label: 'Business Solutions',
                href: 'https://esimfly.net/business',
              },
              {
                label: 'eSIM API Overview',
                href: 'https://esimfly.net/esim-api',
              },
              {
                label: 'Pricing',
                href: 'https://esimfly.net/pricing',
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'API Support',
                href: 'mailto:support@esimfly.net',
              },
              {
                label: 'Contact Sales',
                href: 'https://esimfly.net/contact',
              },
            ],
          },
          {
            title: 'Company',
            items: [
              {
                label: 'About eSIMfly',
                href: 'https://esimfly.net/about',
              },
              {
                label: 'Terms of Service',
                href: 'https://esimfly.net/terms-and-conditions',
              },
              {
                label: 'Privacy Policy',
                href: 'https://esimfly.net/privacy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} eSIMfly. All rights reserved.`,
      },
      prism: {
        theme: codeThemeLight,
        darkTheme: codeThemeDark,
        // json / python ship with prism-react-renderer; these two did not render highlighted
        additionalLanguages: ['bash', 'php'],
      },
    }),
};

export default config;
