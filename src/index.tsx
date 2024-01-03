/// <reference types="@kitajs/html/htmx.d.ts" />
import { html } from '@elysiajs/html'
import { Elysia, t } from 'elysia'

interface Todo {
  id: number
  content: string
  completed: boolean
}

const db: Todo[] = [
  { id: 1, content: 'Buy milk', completed: false },
  { id: 2, content: 'Buy eggs', completed: false },
]

const Layout = ({ children }: Html.PropsWithChildren) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Todo</title>
          <script src="https://unpkg.com/htmx.org@1.9.10"></script>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="h-dvh flex w-full items-center justify-center">{children}</body>
      </html>
    </>
  )
}

const TodoForm = () => {
  return (
    <form class="flex items-center" hx-post="/todos" hx-swap="beforebegin">
      <input type="text" name="content" class="border border-black px-2 py-1 focus:outline-none" />
      <button type="submit" class="border border-l-0 border-black px-2 py-1">
        Add
      </button>
    </form>
  )
}

const TodoItem = ({ content, completed, id }: Todo) => {
  return (
    <div class="flex items-center gap-3 p-1">
      <input type="checkbox" checked={completed} hx-post={`/todos/toggle/${id}`} hx-target="closest div" hx-swap="outerHTML" />
      <p class="mr-auto">{content}</p>
      <button class="font-sans text-red-600" hx-delete={`/todos/${id}`} hx-target="closest div" hx-swap="outerHTML">
        X
      </button>
    </div>
  )
}

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm />
    </>
  )
}

const app = new Elysia()
  .use(html())
  .get('/', () => (
    <Layout>
      <div class="font-serif" hx-get="/todos" hx-trigger="load" hx-swap="innerHTML" />
    </Layout>
  ))
  .get('/todos', () => <TodoList todos={db} />)
  .post(
    'todos',
    ({ body }) => {
      if (body.content) {
        const todo = {
          id: db.length + 1,
          content: body.content,
          completed: false,
        }
        db.push(todo)
        return <TodoItem {...todo} />
      }
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  .post(
    '/todos/toggle/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id)
      if (todo) {
        todo.completed = !todo.completed
        return <TodoItem {...todo} />
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .delete(
    '/todos/:id',
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id)
      if (todo) {
        db.splice(db.indexOf(todo), 1)
      }
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .listen(3000)

console.log(`Server is running on http://${app.server?.hostname}:${app.server?.port}`)
