import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TODOS_PATH = path.join(__dirname, 'todos.json');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Načtení todos
async function loadTodos() {
  try {
    const data = await fs.readFile(TODOS_PATH, 'utf-8');
    const todos = JSON.parse(data);

    return todos.map((todo) => ({
      ...todo,
      priority: todo.priority ?? 'normal',
    }));
  } catch (err) {
    return [];
  }
}

// Uložení todos
async function saveTodos(todos) {
  await fs.writeFile(TODOS_PATH, JSON.stringify(todos, null, 2), 'utf-8');
}

// Seznam todoček
app.get('/', async (req, res) => {
  const todos = await loadTodos();
  res.render('index', { todos });
});

// Detail todočka
app.get('/todo/:id', async (req, res) => {
  const todos = await loadTodos();
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) return res.status(404).send('Todo nenalezeno');
  res.render('todo', { todo });
});

// Změna stavu
app.post('/todo/:id/toggle', async (req, res) => {
  const todos = await loadTodos();
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (todo) {
    todo.done = !todo.done;
    await saveTodos(todos);
  }
  res.redirect(`/todo/${req.params.id}`);
});

// Smazání
app.post('/todo/:id/delete', async (req, res) => {
  let todos = await loadTodos();
  todos = todos.filter((t) => t.id !== Number(req.params.id));
  await saveTodos(todos);
  res.redirect('/');
});

// Úprava titulku
app.post('/todo/:id/edit', async (req, res) => {
  const todos = await loadTodos();
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (todo && req.body.title) {
    todo.title = req.body.title;
    await saveTodos(todos);
  }
  res.redirect(`/todo/${req.params.id}`);
});

// Přidání nového TODO
app.post('/add-todo', async (req, res) => {
  const todos = await loadTodos();

  // Validace
  if (!req.body.title) {
    return res.status(400).send('Titulek je povinný');
  }

  // Generování nového ID (najdi nejvyšší a přičti 1)
  const maxId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) : 0;
  const newTodo = {
    id: maxId + 1,
    title: req.body.title,
    completed: false,
  };

  todos.push(newTodo);
  await saveTodos(todos);

  res.redirect(`/`);
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
