// gatsby-node.ts
import type { GatsbyNode } from 'gatsby';
import webpack from 'webpack';

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  actions,
}) => {
  const { setWebpackConfig } = actions;

  setWebpackConfig({
    plugins: [
      new webpack.ProvidePlugin({
        React: 'react', //
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  });
};
