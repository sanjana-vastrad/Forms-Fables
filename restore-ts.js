const fs = require('fs');
let ts = fs.readFileSync('src/app/Master/services/add-service/add-service.component.ts', 'utf8');

if (!ts.includes('AngularEditorModule')) {
  ts = ts.replace("import { NzCollapseModule } from 'ng-zorro-antd/collapse';", "import { NzCollapseModule } from 'ng-zorro-antd/collapse';\nimport { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';");
  
  ts = ts.replace("NzCollapseModule,\n\n  ],", "NzCollapseModule,\n    AngularEditorModule\n  ],");
  
  const config = `
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter detailed description...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'indent',
        'outdent',
        'heading',
        'fontName'
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode'
      ]
    ]
  };
`;
  
  ts = ts.replace('loading = false;', 'loading = false;\n' + config);
  
  fs.writeFileSync('src/app/Master/services/add-service/add-service.component.ts', ts);
}
