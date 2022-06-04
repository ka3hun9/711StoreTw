import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/main.js",
  output: {
    dir: "dist",
    entryFileNames: "main.js",
    chunkFileNames: "[name]_[hash].js",
    format: "es",
  },
  plugins: [
    commonjs(),
    terser({
      ecma: 5,
      format: {
        comments: false,
      },
      compress: { drop_console: true },
    }),
  ],
};
