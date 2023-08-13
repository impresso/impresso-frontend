const path = require('path');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-scss"
  ],
  "framework": "@storybook/vue",
  webpackFinal: (config) => {

    config.module.rules.push({
      resourceQuery: /blockType=i18n/,
      type: 'javascript/auto',
      loader: require.resolve('@intlify/vue-i18n-loader')
    })

    config.module.rules.push({
      test: /\.scss$/,
      use: [
        require.resolve("vue-style-loader"),
        require.resolve("css-loader"),
        require.resolve("sass-loader"),
      ],
    });

    config.module.rules.push({
      test: /\.sass$/,
      use: [
        require.resolve("vue-style-loader"),
        require.resolve("css-loader"),
        {
          loader: require.resolve("sass-loader"),
          options: {
            sassOptions: {
              indentedSyntax: true
            }
          }
        }
      ],
    });
  
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src/"),
    };
    // keep this if you're doing typescript
    config.resolve.extensions.push(".ts", ".tsx");
    return config;
  },
}