import fs from 'fs/promises';

const INSTRUCTION_FILE = 'instrukce.txt';

async function main() {
  try {
    // Načti instrukce
    const instructions = await fs.readFile(INSTRUCTION_FILE, 'utf-8');
    const [sourceFile, targetFile] = instructions.trim().split(/\s+/);

    if (!sourceFile || !targetFile) {
      console.error('Chyba: instrukce.txt musí obsahovat dva názvy souborů oddělené mezerou.');
      return;
    }

    // Zkontroluj, jestli existuje zdrojový soubor
    try {
      await fs.access(sourceFile);
    } catch (err) {
      console.error(`Chyba: zdrojový soubor "${sourceFile}" neexistuje.`);
      return;
    }

    // Načti obsah zdrojového souboru
    const content = await fs.readFile(sourceFile, 'utf-8');

    // Zapiš obsah do cílového souboru (vytvoří se automaticky, pokud neexistuje)
    await fs.writeFile(targetFile, content, 'utf-8');

    console.log(`Soubor "${sourceFile}" byl úspěšně zkopírován do "${targetFile}".`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Chyba: soubor "${INSTRUCTION_FILE}" neexistuje.`);
    } else {
      console.error('Neočekávaná chyba:', err);
    }
  }
}

main();
