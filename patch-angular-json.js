const fs = require('fs');

const angularJsonPath = 'angular.json';
let angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// Find the build architect for the project (assuming default project name or finding the first application)
const projectName = Object.keys(angularJson.projects)[0];
const buildAssets = angularJson.projects[projectName].architect.build.options.assets;

const kolkovAsset = {
  "glob": "**/*",
  "input": "node_modules/@kolkov/angular-editor/assets/",
  "output": "/assets/"
};

// Check if it already exists to prevent duplicates
const exists = buildAssets.some(asset => typeof asset === 'object' && asset.input === kolkovAsset.input);

if (!exists) {
  buildAssets.push(kolkovAsset);
  fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
  console.log('Added Kolkov assets to angular.json');
} else {
  console.log('Kolkov assets already in angular.json');
}
