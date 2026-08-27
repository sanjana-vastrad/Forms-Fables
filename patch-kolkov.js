const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, 'node_modules', '@kolkov', 'angular-editor', 'fesm2022', 'kolkov-angular-editor.mjs');

if (fs.existsSync(fileToPatch)) {
  let content = fs.readFileSync(fileToPatch, 'utf8');
  
  if (content.includes('import { inject, DOCUMENT, Injectable')) {
    content = content.replace('import { inject, DOCUMENT, Injectable', 'import { inject, Injectable');
    content = 'import { DOCUMENT } from \'@angular/common\';\n' + content;
    fs.writeFileSync(fileToPatch, content, 'utf8');
    console.log('Successfully patched @kolkov/angular-editor for Angular 19 compatibility!');
  } else {
    console.log('Kolkov editor already patched or format changed.');
  }
} else {
  console.log('Kolkov angular editor not found to patch.');
}
