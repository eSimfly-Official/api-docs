// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'eSIMfly Business API',
  tagline: 'Deliver eSIM data packages via the eSIMfly HTTPS API',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
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

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'eSIMfly Business API',
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
          alt: 'eSIMfly Business API',
          src: 'https://esimfly.net/images/logo-blue.svg',
          width: 160,
          height: 51,
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
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
