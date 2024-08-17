module.exports = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          "cleanupIds": false
        }
      }
    },
    // "convertShapeToPath",
    "moveGroupAttrsToElems",
    "collapseGroups",
    {
      name: "convertPathData",
      params: {
        forceAbsolutePath: true
      }
    },
    // "convertTransform",
    // {
    //   name: "applyTransformsShapes",
    // }
  ]
}
