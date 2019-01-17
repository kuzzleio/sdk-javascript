module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 1%']
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-transform-for-of', {'assumeArray': true}]
  ]
};
