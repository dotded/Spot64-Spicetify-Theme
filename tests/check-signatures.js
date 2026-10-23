const fs = require('node:fs');
const path = require('node:path');
const dir=path.resolve(__dirname,'../Extensions');
const rules={
  'spot64Core.js':"const ID = 'tm-root';",
  'spot64Customize.js':"const KEY = 'spot64.customize.v1';",
  'spot64TerminalThemes.js':'spot64-terminal-themes-style',
  'spot64PlaybackLibrary.js':'__spot64PlaybackLibraryLoaded',
  'spot64NowPlayingInfo.js':'__spot64NowPlayingInfoLoaded',
  'spot64Artwork.js':'asciiStudioFactory',
  'spot64AnsiBackground.js':'const LINES = [',
  'spot64Dither.js':'__spot64DitherExtensionLoaded'
};
let failures=0;
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.js'));
const sources=new Map(files.map(file=>[file,fs.readFileSync(path.join(dir,file),'utf8')]));
for(const [name,signature] of Object.entries(rules)){
 const matches=files.filter(f=>sources.get(f).includes(signature));
 if(matches.length!==1||matches[0]!==name){console.error('Collision',name,signature,matches);failures++;}
}
if(failures)process.exit(1);
console.log('PASS: unique installer signatures for 8 extensions');
