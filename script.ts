import fs from 'fs';

const path = './services/geminiService.ts';
let content = fs.readFileSync(path, 'utf8');

const helper = `
export const getLanguageInstruction = (language: string): string => {
    if (language.includes('(English Script)')) {
        const baseLang = language.replace('(English Script)', '').trim();
        return \`Language: \${baseLang} (CRITICAL: You MUST write the \${baseLang} text using the English/Latin alphabet characters only, known as Romanized \${baseLang} or Tanglish/Hinglish/etc. DO NOT use the native \${baseLang} script.)\`;
    }
    return \`Language: \${language}\`;
};
`;

if (!content.includes('getLanguageInstruction')) {
    content = content.replace("const MODEL_FALLBACK = 'gemini-2.5-flash';", "const MODEL_FALLBACK = 'gemini-2.5-flash';\\n" + helper);
}

content = content.replace(/Language: \$\{language\}/g, '${getLanguageInstruction(language)}');

fs.writeFileSync(path, content);
console.log('Done!');
