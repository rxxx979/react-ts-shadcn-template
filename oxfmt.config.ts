import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 120,
  sortImports: true,
  sortPackageJson: true,
  sortTailwindcss: true,
  // 运算符所在位置
  experimentalOperatorPosition: "start",
  // jsdoc
  jsdoc: {
    commentLineStrategy: "multiline",
    separateReturnsFromParam: true,
    separateTagGroups: true,
  },
});
