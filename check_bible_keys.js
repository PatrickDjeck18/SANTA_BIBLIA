const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, 'assets/biblia_spanish.json');
try {
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
    const keys = Object.keys(bibleData);

    const booksToCheck = ['Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos'];

    console.log('Total books found:', keys.length);

    booksToCheck.forEach(book => {
        if (bibleData[book]) {
            console.log(`✅ Found "${book}" with ${Object.keys(bibleData[book]).length} chapters.`);
        } else {
            console.log(`❌ "${book}" NOT FOUND.`);
            // Find similar keys
            const similar = keys.filter(k => k.includes(book) || k.toLowerCase().includes(book.toLowerCase()));
            if (similar.length > 0) {
                console.log(`   Possible matches for "${book}":`, similar);
            }
        }
    });

    // Also list all keys just to be sure if things are missing
    // console.log('All keys:', keys);
} catch (error) {
    console.error('Error reading bible file:', error);
}
