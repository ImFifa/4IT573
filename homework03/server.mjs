import http from 'http';
import fs from 'fs/promises';

const PORT = 3000;
const COUNTER_FILE = 'counter.txt';

// Získání čísla ze souboru nebo inicializace na 0
async function getCounter() {
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf-8');
    return parseInt(data.trim(), 10);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Soubor neexistuje, vytvoř ho s hodnotou 0
      await fs.writeFile(COUNTER_FILE, '0', 'utf-8');
      return 0;
    } else {
      throw err; // jinou chybu přepošli dál
    }
  }
}

// Zápis nového čísla do souboru
async function setCounter(value) {
  await fs.writeFile(COUNTER_FILE, value.toString(), 'utf-8');
}

// Vytvoření handleru pro zvýšení/snížení pomocí vyššího řádu funkce (HOF)
function createUpdateHandler(delta) {
  return async (res) => {
    const current = await getCounter();
    const updated = current + delta;
    await setCounter(updated);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  };
}

// Handler pro čtení hodnoty
async function handleRead(res) {
  const value = await getCounter();
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(value.toString());
}

// Spuštění serveru
const server = http.createServer(async (req, res) => {
  const url = req.url;

  if (url === '/increase') {
    await createUpdateHandler(1)(res);
  } else if (url === '/decrease') {
    await createUpdateHandler(-1)(res);
  } else if (url === '/read') {
    await handleRead(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
