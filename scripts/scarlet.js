const path = require('path');
const fs = require('fs');
const bplist = require('bplist-parser');

var scarletJSON = JSON.parse(fs.readFileSync(path.resolve(path.resolve(__dirname), '../scarlet.json'), 'utf-8'));

const spawn = require('child_process').spawn;
spawn('curl', [
    '-LOJs', 
    'https://github.com/jbmagination/locus-ios/releases/latest/download/Locus.ipa'
], { cwd: path.resolve(path.resolve(__dirname), '../tmp') });
const unzip = spawn('unzip', [ '-o', 'Locus.ipa' ], { cwd: path.resolve(path.resolve(__dirname), '../tmp') });

unzip.on('exit', async () => {
    const obj = await bplist.parseFile(path.resolve(path.resolve(__dirname), '../tmp/Payload/Runner.app/Info.plist'));
    const plist = obj[0];
    scarletJSON.META.repoName = plist['CFBundleDisplayName']
    scarletJSON.Locus[0].name = plist['CFBundleDisplayName']
    scarletJSON.Locus[0].category = plist['CFBundleDisplayName']
    scarletJSON.Locus[0].version = plist['CFBundleShortVersionString']
    scarletJSON.Locus[0].down = `https://github.com/jbmagination/locus-ios/releases/${plist['CFBundleShortVersionString']}/download/Locus.ipa`;
    scarletJSON.Locus[0].bundleID = plist['CFBundleIdentifier']
})

fetch(`https://api.github.com/repos/Myzel394/locus/releases/${fs.readFileSync(path.resolve(path.resolve(__dirname), '../release.txt'), 'utf-8')}`)
.then(res => res.json())
.then(data => {
    scarletJSON.Locus[0].changelog = data.body;
})

setTimeout(() => { fs.writeFileSync(path.resolve(path.resolve(__dirname), '../scarlet.json'), JSON.stringify(scarletJSON, null, 2)) }, 5000);