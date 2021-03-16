const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const filteredUser = users.find(user=> user.username === username);

  if(!filteredUser){
    return response.status(400).json({error: 'User not found'})
  }

  request.filteredUser = filteredUser;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const filteredUser = users.find(user=> user.username === username);

  if(filteredUser){
    return response.status(400).json({error:'User already exists'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {filteredUser} = request;

  return response.status(200).json(filteredUser.todos)
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const {filteredUser} = request;

  let newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date().toDateString()
  }

  filteredUser.todos.push(newTodo);

  return response.status(201).send(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {title, deadline} = request.body;

  let {filteredUser} = request;

  let filteredTodo = filteredUser.todos.filter(todo=> todo.id === id)[0];

  if(!filteredTodo) {
    return response.status(404).json({error: 'Todo not found'})
  }

  filteredUser = filteredUser.todos.map(todo=> {
    if(todo.id === id){
      todo.title = title;
      todo.deadline = deadline;
    }
    return todo
  })

  return response.status(201).send(filteredTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;

  const {filteredUser} = request;

  let filteredTodo = filteredUser.todos.filter(todo=> todo.id === id)[0];

  if(!filteredTodo) {
    return response.status(404).json({error: 'Todo not found'})
  }

  filteredTodo.done = !filteredTodo.done;

  return response.status(201).send(filteredTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;

  const {filteredUser} = request;

  let filteredTodo = filteredUser.todos.filter(todo=> todo.id === id)[0];

  if(!filteredTodo) {
    return response.status(404).json({error: 'Todo not found'})
  }

  filteredUser.todos.splice(filteredTodo, 1);

  return response.status(204).send(filteredUser);

});

module.exports = app;