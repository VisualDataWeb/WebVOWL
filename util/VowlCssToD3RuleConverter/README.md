# VOWLCSSToD3RuleConverter

This tool converts all rules from the `vowl.css` file into javascript code that can be executed to
inline the styles. This is required because otherwise the exported SVG files won't have any styles.

This should be integrated into the build process so it won't be overlooked.


## How to run

1. Run `npm install` in the root directory of this project to install the dependency which
processes the css code.
2. Run it with `node code.js` to receive the javascript code which can inline and remove the styles.
3. Insert the two code blocks into the matching functions in the `exportMenu.js` file.
