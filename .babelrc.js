module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['> 1%']
        }
      }
    ],
    "@babel/preset-react"
  ]
};
