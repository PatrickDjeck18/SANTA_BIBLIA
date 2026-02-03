const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, 'assets/biblia_spanish.json');
try {
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
    const keys = Object.keys(bibleData);

    const acts = keys.find(k => k.includes('Hechos'));
    console.log('Acts key:', `'${acts}'`);

} catch (error) {
    console.error('Error reading bible file:', error);
}
