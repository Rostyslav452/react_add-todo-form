import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user: User;
}

type CreatedTodo = Omit<Todo, 'user' | 'completed' | 'id'> & {
  userId: number;
  completed?: boolean;
};

const completedData: Todo[] = todosFromServer.reduce<Todo[]>((acc, todo) => {
  const foundUser = usersFromServer.find(
    (user: User) => user.id === todo.userId,
  );

  if (foundUser) {
    acc.push({
      ...todo,
      user: foundUser,
    });
  }

  return acc;
}, []);

export const App = () => {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');

  const [userId, setUserId] = useState(0);
  const [userIdError, setUserIdError] = useState('');

  const [todos, setTodos] = useState<Todo[]>(completedData);

  const onAdd = (newTodo: CreatedTodo) => {
    setTodos(currentTodos => {
      const allIndexes = currentTodos.map(e => e.id);
      const id = allIndexes.length === 0 ? 1 : Math.max(...allIndexes);

      const user = usersFromServer.find((u: User) => u.id === newTodo.userId);

      if (!user) {
        return currentTodos;
      }

      return [
        ...currentTodos,
        {
          title: newTodo.title,
          completed: newTodo.completed,
          user,
          id: id + 1,
        },
      ];
    });
  };

  const onReset = () => {
    setTitle('');
    setTitleError('');
    setUserId(0);
    setUserIdError('');
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setUserIdError('Please choose a user');
    }

    if (!title.trim()) {
      setTitleError('Please enter a title');
    }

    if (!userId || !title) {
      return;
    }

    onAdd({ title, userId });
    onReset();
  };

  const titleHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleError('');
    setTitle(e.target.value);
  };

  const userIdHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserIdError('');
    setUserId(+e.target.value);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST" onSubmit={onSubmit}>
        <div className="field">
          <input
            type="text"
            value={title}
            data-cy="titleInput"
            onChange={titleHandler}
          />
          {titleError !== '' && <span className="error">{titleError}</span>}
        </div>

        <div className="field">
          <select data-cy="userSelect" value={userId} onChange={userIdHandler}>
            <option value="0">Choose a user</option>
            {usersFromServer.map(user => (
              <option value={user.id} key={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {userIdError !== '' && <span className="error">{userIdError}</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
