import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Output path guard failed');
// Only the explicitly resolved project dist folder is replaced. Never copy local/ or arbitrary root files.
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const file of ['index.html','paper.html','methods.html','.nojekyll','AGENTS.md','README.md']) await fs.copyFile(path.join(root,file),path.join(output,file));
for (const folder of ['assets','prompts','templates','docs']) await fs.cp(path.join(root,folder),path.join(output,folder),{recursive:true});
await fs.mkdir(path.join(output,'content/papers'),{recursive:true});
await fs.mkdir(path.join(output,'content/methods'),{recursive:true});
const ids=JSON.parse(await fs.readFile(path.join(root,'content/papers/index.json'),'utf8'));
await fs.copyFile(path.join(root,'content/papers/index.json'),path.join(output,'content/papers/index.json'));
for(const id of ids) await fs.copyFile(path.join(root,'content/papers',id+'.json'),path.join(output,'content/papers',id+'.json'));
await fs.copyFile(path.join(root,'content/methods/index.json'),path.join(output,'content/methods/index.json'));
console.log('Built dist/ using an explicit public-file allowlist. Included '+ids.length+' published papers; excluded local sources, draft papers, tests and server code.');
