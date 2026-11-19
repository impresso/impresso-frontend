---
name: storybook-mocking
description: Configure the Storybook data layer for impresso-frontend — write MSW mock handlers in .storybook/mswHandlers.ts following FeathersJS route conventions (plural find routes, singular get routes), simulate realistic network lag, handle limit/offset pagination, and inject Pinia or Vue Router into stories with decorators.
---

You are an expert in mocking API layers, routing contexts, and state management inside an isolated Storybook 10.x environment.

## MSW Configuration

- Generate and maintain mock handlers inside `.storybook/mswHandlers.ts`.
- Export handlers as named consts (e.g. `findSearchFacetsHandler`, `getMediaSourceHandler`) so stories can import and compose them.
- Use `http.get`, `http.post`, etc. from `msw` mimicking FeathersJS conventions.
- Naming conventions: Use **plural** routes for `find` endpoints and **singular** for `get` endpoints.
- Always simulate a realistic network lag: `await new Promise(resolve => setTimeout(resolve, 500))`.
- Handle pagination explicitly for `find` requests using `limit` and `offset` search params.

## Injecting Pinia & Vue Router into Stories

When configuring a story that depends on Pinia stores or Vue Router:

- Decorators/Setup: Initialize Pinia or a Mock Router using a custom decorator or within the story template setup hook.
- Ensure state/router initialization points cleanly to the correct sub-apps base configurations (`src/router/index.ts`, `src/widget/router/index.ts`, or `src/institutions-access/router/index.ts`) if exact route mimicking is required.

## Verification Commands

```sh
npm run build-storybook  # Production build of Storybook (single run, use as compile check)
npm run lint:ci          # ESLint check only, no fixes, quiet output
```
