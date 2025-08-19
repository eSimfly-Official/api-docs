// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quick-start',
      label: 'Quick Start',
    },
    {
      type: 'doc',
      id: 'api-authentication',
      label: 'Authentication',
    },
    {
      type: 'category',
      label: 'API Endpoints',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'api/balance',
          label: 'Balance Query',
        },
        {
          type: 'doc',
          id: 'api/packages',
          label: 'Get All Packages',
        },
        {
          type: 'doc',
          id: 'api/create-order',
          label: 'Create Order',
        },
        {
          type: 'doc',
          id: 'api/topup-packages',
          label: 'Get Topup Packages',
        },
        {
          type: 'doc',
          id: 'api/topup-order',
          label: 'Process Topup Order',
        },
        {
          type: 'doc',
          id: 'api/esims',
          label: 'List All eSIMs',
        },
        {
          type: 'doc',
          id: 'api/esims-usage',
          label: 'Query eSIM Usage',
        },
        {
          type: 'doc',
          id: 'api/orders',
          label: 'Orders',
        },
      ],
    },
    {
      type: 'doc',
      id: 'api-reference',
      label: 'Full API Reference',
    },
    {
      type: 'doc',
      id: 'examples',
      label: 'Code Examples',
    },
  ],
};

export default sidebars;
