const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add `isStandaloneTechnical` right before the return statement.
code = code.replace(/return \(\n\s*<div className="min-h-screen">/g, `const isStandaloneTechnical = new URLSearchParams(window.location.search).get('view') === 'technical';

  if (isStandaloneTechnical) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* We need to render the technical sheet card here. Since it's big, we'll extract it by capturing it and injecting it here. */}
          STANDALONE_TECHNICAL_SHEET_PLACEHOLDER
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">`);

// Now extract the technical sheet card.
const techSheetMatch = code.match(/<Card className="overflow-hidden">[\s\S]*?<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50\/70">[\s\S]*?\{t\.technicalSheet\}<\/CardTitle>[\s\S]*?<\/Card>/);

if (techSheetMatch) {
  code = code.replace('STANDALONE_TECHNICAL_SHEET_PLACEHOLDER', techSheetMatch[0]);
}

// 2. Change the 'Details' button link to include `&view=technical`
code = code.replace(/window\.open\(\`\/\?profile=\$\{p\.id\}\`, '_blank'\)/g, "window.open(`/?profile=${p.id}&view=technical`, '_blank')");

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed standalone view logic in App.tsx');
