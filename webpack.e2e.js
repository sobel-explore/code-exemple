console.log('>>> webpack.e2e.js chargé');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts)$/,
          include: path.resolve(__dirname, 'src/app'), 
        exclude: /\.spec\.ts$/,
        enforce: 'post',
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['istanbul'],
          },
        },
      },
    ],
  },
};
