const path = require('path');
const fs = require('fs');
const bplist = require('bplist-parser');
const crypto = require('crypto');
const { exit } = require('process');

var altJSON = JSON.parse(fs.readFileSync(path.resolve(path.resolve(__dirname), '../alt.json'), 'utf-8'));

let newVersion = {};
newVersion.version = null;
newVersion.date = null;
newVersion.localizedDescription = null;
newVersion.downloadURL = null;
newVersion.size = null;
newVersion.sha256 = null;

const spawn = require('child_process').spawn;
const curl = spawn('curl', [
    '-H',
    '"Authorization: Bearer $GH_TOKEN"',
    '-LOJs', 
    'https://github.com/jbmagination/locus-ios/releases/latest/download/Locus.ipa'
], { cwd: path.resolve(path.resolve(__dirname), '../tmp') });

curl.on('exit', () => {
    const fileBuffer = fs.readFileSync(path.resolve(path.resolve(__dirname), '../tmp/Locus.ipa'));
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    newVersion.sha256 = hex;

    const stats = fs.statSync(path.resolve(path.resolve(__dirname), '../tmp/Locus.ipa'));
    altJSON.apps[0].size = stats.size;
    newVersion.size = stats.size;
})

const unzip = spawn('unzip', [ '-o', 'Locus.ipa' ], { cwd: path.resolve(path.resolve(__dirname), '../tmp') });

unzip.on('exit', async () => {
    const infoPath = path.resolve(path.resolve(__dirname), '../tmp/Payload/Runner.app/Info.plist');
    let obj;
    await bplist.parseFile(infoPath, (err, data) => {
        if (err) {
            console.error(err);
            exit(1);
        } else obj = data;
    });
    const plist = obj[0];
    var permissions = [];
    var appPermissions = {};
    let photosUsageDescription = [];
    let locationUsageDescription = [];
    let locDesc = null;
    let locDescAlways = null;
    var bluetoothUsageDescription = [];

    altJSON.name = plist['CFBundleDisplayName']
    altJSON.apps[0].name = plist['CFBundleDisplayName']
    
    altJSON.apps[0].version = plist['CFBundleShortVersionString']
    newVersion.version = plist['CFBundleShortVersionString']
    
    altJSON.apps[0].downloadURL = `https://github.com/jbmagination/locus-ios/releases/${plist['CFBundleShortVersionString']}/download/Locus.ipa`;
    newVersion.downloadURL = `https://github.com/jbmagination/locus-ios/releases/${plist['CFBundleShortVersionString']}/download/Locus.ipa`;
    
    altJSON.identifier = plist['CFBundleIdentifier']
    altJSON.featuredApps[0] = plist['CFBundleIdentifier']
    altJSON.apps[0].bundleIdentifier = plist['CFBundleIdentifier']
    
    newVersion.minOSVersion = plist['MinimumOSVersion']

    for (item in Object.keys(plist)) {
        var desc = Object.keys(plist)[item]
        if (desc.endsWith('UsageDescription')) appPermissions[desc] = plist[desc]
        if (item == (Object.keys(plist).length - 1)) altJSON.apps[0].appPermissions.privacy = appPermissions
    }
    
    if (plist['NSPhotoLibraryUsageDescription']) photosUsageDescription.push(plist['NSPhotoLibraryUsageDescription'])
    if (plist['NSPhotoLibraryAddUsageDescription']) photosUsageDescription.push(plist['NSPhotoLibraryAddUsageDescription'])
    if (photosUsageDescription.length > 0) {
        photosUsageDescription = [...new Set(photosUsageDescription)].join(' ');
        permissions.push({
            "type": "photos",
            "usageDescription": photosUsageDescription
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSCameraUsageDescription']) {
        permissions.push({
            "type": "camera",
            "usageDescription": plist['NSCameraUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSLocationUsageDescription']) locDesc = plist['NSLocationUsageDescription']
    if (plist['NSLocationAlwaysUsageDescription']) locDescAlways = plist['NSLocationAlwaysUsageDescription'];
    if (plist['NSLocationWhenInUseUsageDescription']) locDesc = plist['NSLocationWhenInUseUsageDescription']
    if (plist['NSLocationAlwaysAndWhenInUseUsageDescription']) locDescAlways = plist['NSLocationAlwaysAndWhenInUseUsageDescription'];
    if (locDesc) locationUsageDescription.push(locDesc);
    if (locDescAlways) locationUsageDescription.push(locDesc);
    if (plist['NSLocationTemporaryUsageDescription']) locationUsageDescription.push(plist['NSLocationTemporaryUsageDescription']);
    if (locationUsageDescription.length > 0) {
        locationUsageDescription = [...new Set(locationUsageDescription)].join(' ');
        permissions.push({
            "type": "location",
            "usageDescription": locationUsageDescription
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSContactsUsageDescription']) {
        permissions.push({
            "type": "contacts",
            "usageDescription": plist['NSContactsUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSRemindersUsageDescription']) {
        permissions.push({
            "type": "reminders",
            "usageDescription": plist['NSRemindersUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSAppleMusicUsageDescription']) {
        permissions.push({
            "type": "music",
            "usageDescription": plist['NSAppleMusicUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSMicrophoneUsageDescription']) {
        permissions.push({
            "type": "microphone",
            "usageDescription": plist['NSMicrophoneUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSSpeechRecognitionUsageDescription']) {
        permissions.push({
            "type": "speech-recognition",
            "usageDescription": plist['NSSpeechRecognitionUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    permissions.push({
        "type": "background-fetch",
        "usageDescription": "Locus needs to run in the background to be able to access your location while the app isn't open."
    })
    altJSON.apps[0].permissions = permissions;

    if (plist['NSBluetoothAlwaysUsageDescription']) bluetoothUsageDescription.push(plist['NSBluetoothAlwaysUsageDescription'])
    if (plist['NSBluetoothPeripheralUsageDescription']) bluetoothUsageDescription.push(plist['NSBluetoothPeripheralUsageDescription'])
    if (bluetoothUsageDescription.length > 0) {
        bluetoothUsageDescription = [...new Set(bluetoothUsageDescription)].join(' ');
        permissions.push({
            "type": "bluetooth",
            "usageDescription": bluetoothUsageDescription
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSLocalNetworkUsageDescription']) {
        permissions.push({
            "type": "network",
            "usageDescription": plist['NSLocalNetworkUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSCalendarsUsageDescription']) {
        permissions.push({
            "type": "calendars",
            "usageDescription": plist['NSCalendarsUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSFaceIDUsageDescription']) {
        permissions.push({
            "type": "faceid",
            "usageDescription": plist['NSFaceIDUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSSiriUsageDescription']) {
        permissions.push({
            "type": "siri",
            "usageDescription": plist['NSSiriUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }

    if (plist['NSMotionUsageDescription']) {
        permissions.push({
            "type": "motion",
            "usageDescription": plist['NSMotionUsageDescription']
        })
        altJSON.apps[0].permissions = permissions;
    }
})

fetch(`https://api.github.com/repos/Myzel394/locus/releases/${fs.readFileSync(path.resolve(path.resolve(__dirname), '../release.txt'), 'utf-8')}`, {
    headers: {
        "Authorization": process.env.GH_TOKEN
    }
})
.then(res => res.json())
.then(data => {
    altJSON.apps[0].versionDate = data['published_at'];
    newVersion.date = data['published_at'];
    altJSON.apps[0].versionDescription = data['body'];
    newVersion.localizedDescription = data['body'];
})

setTimeout(() => { altJSON.apps[0].versions.unshift(newVersion); fs.writeFileSync(path.resolve(path.resolve(__dirname), '../alt.json'), JSON.stringify(altJSON, null, 2)) }, 5000);
