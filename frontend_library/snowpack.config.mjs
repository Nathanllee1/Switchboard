export default {

  root: "src",
  buildOptions : {
    out: "build"
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
    entrypoints: [
      "src/ws_interface.ts"
    ]
  },
};
