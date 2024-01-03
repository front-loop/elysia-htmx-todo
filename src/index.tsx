/// <reference types="@kitajs/html/htmx.d.ts" />
import { html } from '@elysiajs/html'
import { Elysia, t } from 'elysia'
import { Todo, todos } from './db/schema'
import { db } from './db'
import { eq } from 'drizzle-orm'

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
          <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="h-dvh flex w-full items-center justify-center">{children}</body>
      </html>
    </>
  )
}

const TodoForm = () => {
  return (
    <form class="flex items-center" hx-post="/todos" hx-swap="beforebegin" _="on submit target.reset()">
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
  .get('/todos', async () => {
    const data = await db.select().from(todos).all()
    return <TodoList todos={data} />
  })
  .post(
    'todos',
    async ({ body }) => {
      if (body.content.length === 0) {
        throw new Error('Content cannot be empty')
      }
      const newTodo = await db.insert(todos).values(body).returning().get()
      return <TodoItem {...newTodo} />
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  .post(
    '/todos/toggle/:id',
    async ({ params }) => {
      const oldTodo = await db.select().from(todos).where(eq(todos.id, params.id)).get()
      const newTodo = await db.update(todos).set({ completed: !oldTodo!.completed }).where(eq(todos.id, params.id)).returning().get()
      return <TodoItem {...newTodo} />
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .delete(
    '/todos/:id',
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id)).run()
    },
    {
      params: t.Object({ id: t.Numeric() }),
    }
  )
  .listen(3000)

console.log(`Server is running on http://${app.server?.hostname}:${app.server?.port}`)
