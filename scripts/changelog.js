const fs = require('fs');
const path = require('path');
fetch(`https://api.github.com/repos/Myzel394/locus/releases/${fs.readFileSync(path.resolve(path.resolve(__dirname), '../release.txt'), 'utf-8')}`, {
    headers: {
        "Authorization": process.env.GH_TOKEN
    }
})
.then(res => res.json())
.then(data => {
    let changelog = `> [!IMPORTANT]\n> This repository is not verified by or affiliated with Myzel394 or any other Locus developers. The below changelog is from [the original repository](${data['html_url']}).\n\n<hr>\n\n${data['body']}`;
    fs.writeFileSync(path.resolve(path.resolve(__dirname), '../tmp/changelog.txt'), changelog);
})
