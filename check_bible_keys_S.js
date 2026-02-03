const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, 'assets/biblia_spanish.json');
try {
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
    const keys = Object.keys(bibleData);

    const sBooks = keys.filter(k => k.startsWith('S.'));
    console.log('Books starting with S.:', sBooks.map(k => `'${k}'`));

} catch (error) {
    console.error('Error reading bible file:', error);
}
