import fs from 'fs/promises';

const INSTRUCTION_FILE = 'instrukce.txt';

async function main() {
  try {
    const data = await fs.readFile(INSTRUCTION_FILE, 'utf-8');
    const n = parseInt(data.trim(), 10);

    if (isNaN(n) || n < 0) {
      console.error('Chyba: instrukce.txt musí obsahovat nezáporné celé číslo.');
      return;
    }

    const tasks = [];

    for (let i = 0; i <= n; i++) {
      const filename = `${i}.txt`;
      const content = `Soubor ${i}`;
      tasks.push(fs.writeFile(filename, content, 'utf-8'));
    }

    await Promise.all(tasks);
    console.log(`Vytvořeno ${n + 1} souborů (0.txt až ${n}.txt) – paralelně.`);
  } catch (err) {
    console.error('Chyba při zpracování:', err.message);
  }
}

main();
