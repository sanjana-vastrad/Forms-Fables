const fs = require('fs');
let html = fs.readFileSync('src/app/Master/services/add-service/add-service.component.html', 'utf8');

const regex = /<textarea formControlName=\"description\" placeholder=\"Enter benefit description\" \nclass=\"premium-input\" rows=\"2\"><\/textarea>/g;
// Wait, no. The user's grep output showed:
// <textarea formControlName="description" placeholder="Enter benefit description" class="premium-input" rows="2"></textarea>
// But the MAIN description is:
// <textarea nz-input formControlName="description" rows="6" class="premium-input" placeholder="Enter detailed description"></textarea>

html = html.replace(/<textarea nz-input formControlName="description" rows="6" class="premium-input" placeholder="Enter detailed description"><\/textarea>/g, '<angular-editor formControlName="description" [config]="editorConfig"></angular-editor>');

fs.writeFileSync('src/app/Master/services/add-service/add-service.component.html', html);
