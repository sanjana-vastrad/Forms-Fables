const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

// Remove the old i.fa block
css = css.replace(/\/\* Static SVG Icons for Angular Editor \*\/[\s\S]*?\/\* End Static SVGs \*\//, '');
css = css.replace(/\.angular-editor-toolbar i\.fa[\s\S]*?\.angular-editor-toolbar \.fa-eraser [^\n]+\n/g, '');

const svg = (path) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000'%3E%3Cpath d='${path}'/%3E%3C/svg%3E")`;

const newCss = `
/* Static SVG Icons for Angular Editor (Fix for SVG Sprite Version) */
.angular-editor-toolbar .angular-editor-button svg {
  display: none !important;
}
.angular-editor-toolbar .angular-editor-button {
  display: inline-block !important;
  width: 32px !important;
  height: 32px !important;
  background-size: 18px 18px !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

.angular-editor-toolbar .angular-editor-button[title="Bold"] { background-image: ${svg('M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z')}; }
.angular-editor-toolbar .angular-editor-button[title="Italic"] { background-image: ${svg('M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z')}; }
.angular-editor-toolbar .angular-editor-button[title="Underline"] { background-image: ${svg('M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z')}; }
.angular-editor-toolbar .angular-editor-button[title="Strike Through"] { background-image: ${svg('M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z')}; }
.angular-editor-toolbar .angular-editor-button[title="Justify Left"] { background-image: ${svg('M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z')}; }
.angular-editor-toolbar .angular-editor-button[title="Justify Center"] { background-image: ${svg('M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z')}; }
.angular-editor-toolbar .angular-editor-button[title="Justify Right"] { background-image: ${svg('M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z')}; }
.angular-editor-toolbar .angular-editor-button[title="Justify Full"] { background-image: ${svg('M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z')}; }
.angular-editor-toolbar .angular-editor-button[title="Unordered List"] { background-image: ${svg('M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z')}; }
.angular-editor-toolbar .angular-editor-button[title="Ordered List"] { background-image: ${svg('M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z')}; }
.angular-editor-toolbar .angular-editor-button[title="Undo"] { background-image: ${svg('M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z')}; }
.angular-editor-toolbar .angular-editor-button[title="Redo"] { background-image: ${svg('M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22l2.37.78c1.05-3.19 4.06-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z')}; }
.angular-editor-toolbar .angular-editor-button[title="Clear Formatting"] { background-image: ${svg('M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.44 20.4a2 2 0 0 0 2.83 0l11.14-11.14c.78-.77.78-2.04 0-2.83l-2.85-2.85A1.97 1.97 0 0 0 15.14 3zm-.41 11.14-5.3-5.3 4.31-4.3 5.29 5.3-4.3 4.3z')}; }
`;

fs.writeFileSync('src/styles.css', css + newCss);
