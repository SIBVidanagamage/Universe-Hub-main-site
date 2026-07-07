const fs = require('fs');

let content = fs.readFileSync('src/app/App.tsx', 'utf-8');
content = content.replace('onNav("brand", undefined, undefined, b.name)', '(onNav as any)("brand", undefined, undefined, b.name)');
content = content.replace('id: 999999 as any,', 'id: 999999 as any, location: "Colombo", product: product.name,');
fs.writeFileSync('src/app/App.tsx', content, 'utf-8');

let sup = fs.readFileSync('src/app/utils/supabaseClient.ts', 'utf-8');
sup = sup.replace('import.meta.env', '(import.meta as any).env');
sup = sup.replace('import.meta.env', '(import.meta as any).env');
fs.writeFileSync('src/app/utils/supabaseClient.ts', sup, 'utf-8');

let main = fs.readFileSync('src/main.tsx', 'utf-8');
main = main.replace('import "./styles/index.css";', '// @ts-ignore\nimport "./styles/index.css";');
fs.writeFileSync('src/main.tsx', main, 'utf-8');

console.log("Done");
