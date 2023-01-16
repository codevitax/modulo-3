const express = require("express");
const bodyParser = require("body-parser");
const pg = require('pg');

const config = {
  user: 'registro_db_user',
  database: 'registro_db',
  password: 'xjW70QRKl639VfrzIDWGTYBzOu8CBOrE',
  host: 'dpg-cf2n4k1gp3jl0q2e1b7g-a.oregon-postgres.render.com',
  port: 5432,
  ssl: true,
  idleTimeoutMillis: 3000
}

const client = new pg.Pool(config)

// Modelo
class TodoModel {
  constructor() {
    this.todos = [];
  }

  async getTodos(){
    const res = await client.query('select * from todos;')
    console.log(res);
    return res.rows
  }

  async addTodo(todoText) {
    const query = 'INSERT INTO todos(id, task) VALUES($1, $2) RETURNING *';
    const values = [Math.floor(1000 + Math.random() * 9000), todoText]
    const res = await client.query(query, values)
    return res;
  }

  editTodo(index, todoText) {
    this.todos[index].text = todoText;
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
  }

  toggleTodo(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

// Controlador
class TodoController {
  constructor(model) {
    this.model = model;
  }

  async getTodos() {
   return await this.model.getTodos();
  }

  async addTodo(todoText) {
    await this.model.addTodo(todoText);
  }

  editTodo(index, todoText) {
    this.model.editTodo(index, todoText);
  }

  deleteTodo(index) {
    this.model.deleteTodo(index);
  }

  toggleTodo(index) {
    this.model.toggleTodo(index);
  }
}

// Vistas (Rutas)
const app = express();
const todoModel = new TodoModel();
const todoController = new TodoController(todoModel);

app.use(bodyParser.json());

app.get("/todos",async  (req, res) => {
  const response = await todoController.getTodos()
  res.json(response)
});

// Vistas (Rutas) (continuación)
app.post("/todos", (req, res) => {
  const todoText = req.body.text;
  console.log(req.body)
  todoController.addTodo(todoText);
  res.sendStatus(200);
});

app.put("/todos/:index", (req, res) => {
  const index = req.params.index;
  const todoText = req.body.text;
  todoController.editTodo(index, todoText);
  res.sendStatus(200);
});

app.delete("/todos/:index", (req, res) => {
  const index = req.params.index;
  todoController.deleteTodo(index);
  res.sendStatus(200);
});

app.patch("/todos/:index", (req, res) => {
  const index = req.params.index;
  todoController.toggleTodo(index);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});