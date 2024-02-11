const fs = require('fs');
const path = require('path');
const bplist = require('bplist-parser');

(async () => {
    const obj = await bplist.parseFile(path.resolve(path.resolve(__dirname), '../tmp/Payload/Runner.app/Info.plist'));
    const plist = obj[0];
    let version = plist['CFBundleShortVersionString'];
    fs.writeFileSync(path.resolve(path.resolve(__dirname), '../tmp/version.txt'), version);
})();