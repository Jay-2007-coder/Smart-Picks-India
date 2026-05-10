const fs = require('fs');
let lines = fs.readFileSync('data/products.ts', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes('export const products: Product[] = ['));
const iphoneIndex = lines.findIndex(l => l.includes('slug: "apple-iphone-15-128gb-black-review"'));
if (startIndex !== -1 && iphoneIndex !== -1) {
  const newLines = [
    ...lines.slice(0, startIndex + 1),
    '  {',
    ...lines.slice(iphoneIndex)
  ];
  fs.writeFileSync('data/products.ts', newLines.join('\n'));
}
