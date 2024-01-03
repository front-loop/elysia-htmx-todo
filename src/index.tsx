/// <reference types="@kitajs/html/htmx.d.ts" />
import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'

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
        <body>{children}</body>
      </html>
    </>
  )
}

const app = new Elysia()
  .use(html())
  .get('/', () => (
    <Layout>
      <div class="flex w-full h-dvh justify-center items-center font-serif">
        <button hx-post="/clicked" hx-swap="outerHTML">
          Click Me
        </button>
      </div>
    </Layout>
  ))
  .post('/clicked', () => <div>Hello from the elysia server!</div>)
  .listen(3000)

console.log(`Server is running on http://${app.server?.hostname}:${app.server?.port}`)
