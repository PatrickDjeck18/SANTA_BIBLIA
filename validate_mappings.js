const fs = require('fs');
const path = require('path');
// Import mapping manualy since we can't easily import TS in node without compilation or ts-node
// I'll copy the mapping object here for the check script
const BOOK_ID_TO_SPANISH_NAME = {
    'GEN': 'Génesis', 'EXO': 'Éxodo', 'LEV': 'Levítico', 'NUM': 'Números', 'DEU': 'Deuteronomio',
    'JOS': 'Josué', 'JDG': 'Jueces', 'RUT': 'Rut',
    '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Reyes', '2KI': '2 Reyes',
    '1CH': '1 Crónicas', '2CH': '2 Crónicas', 'EZR': 'Esdras', 'NEH': 'Nehemías', 'EST': 'Ester',
    'JOB': 'Job', 'PSA': 'Salmos', 'PRO': 'Proverbios', 'ECC': 'Eclesiastés', 'SNG': 'Cantares',
    'ISA': 'Isaías', 'JER': 'Jeremías', 'LAM': 'Lamentaciones', 'EZK': 'Ezequiel', 'DAN': 'Daniel',
    'HOS': 'Oseas', 'JOL': 'Joel', 'AMO': 'Amós', 'OBA': 'Abdías', 'JON': 'Jonás', 'MIC': 'Miqueas',
    'NAM': 'Nahúm', 'HAB': 'Habacuc', 'ZEP': 'Sofonías', 'HAG': 'Hageo', 'ZEC': 'Zacarías', 'MAL': 'Malaquías',
    'MAT': 'S. Mateo', 'MRK': 'S. Marcos', 'LUK': 'S. Lucas', 'JHN': 'S.Juan', 'ACT': 'Hechos',
    'ROM': 'Romanos', '1CO': '1 Corintios', '2CO': '2 Corintios', 'GAL': 'Gálatas', 'EPH': 'Efesios',
    'PHP': 'Filipenses', 'COL': 'Colosenses', '1TH': '1 Tesalonicenses', '2TH': '2 Tesalonicenses',
    '1TI': '1 Timoteo', '2TI': '2 Timoteo', 'TIT': 'Tito', 'PHM': 'Filemón',
    'HEB': 'Hebreos', 'JAS': 'Santiago', '1PE': '1 Pedro', '2PE': '2 Pedro',
    '1JN': '1 Juan', '2JN': '2 Juan', '3JN': '3 Juan', 'JUD': 'Judas', 'REV': 'Apocalipsis',
};

const biblePath = path.join(__dirname, 'assets/biblia_spanish.json');

try {
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
    const jsonKeys = Object.keys(bibleData);

    console.log('Checking all mappings...');
    let errorCount = 0;

    for (const [id, name] of Object.entries(BOOK_ID_TO_SPANISH_NAME)) {
        if (!bibleData[name]) {
            console.log(`❌ Mapping for ${id} -> "${name}" NOT FOUND in JSON.`);
            const similar = jsonKeys.filter(k => k.toLowerCase().includes(name.toLowerCase().replace('s.', '').trim().substring(0, 4)));
            if (similar.length > 0) {
                console.log(`   Possible matches for "${name}":`, similar);
            }
            errorCount++;
        }
    }

    if (errorCount === 0) {
        console.log('✅ All mappings are correct!');
    } else {
        console.log(`found ${errorCount} errors.`);
    }

} catch (error) {
    console.error('Error:', error);
}
