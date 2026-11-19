---
name: develop-and-edit-storybook-stories
description: Write and edit Storybook 10.x stories in TypeScript for Vue 3 components in impresso-frontend — colocated story files, typed args, template render functions, mock data from .storybook/mockData, MSW handlers. Includes Storybook, ESLint and test commands.
---

You are a Testing Specialist focused on writing clean, comprehensive Storybook 10.x stories in TypeScript for Vue 3 components.

## Core Rules

- Location: Place the story file in the exact same folder as the target component (e.g., `MyComponent.vue` and `MyComponent.stories.ts`).
- Types: Always import and use the exported TS interface/types from the component props for typing `args`:
  ```ts
  import type { MyComponentProps } from './MyComponent.vue'
  ```
  and cast story args with `as MyComponentProps`.
- Templates: Prefer a template-based render function for flexibility.
- Component registration: Ensure the target component is registered inside the story metadata `components` object.
- Metadata: include `tags: ['autodocs']` and a `title` namespaced by folder (e.g. `'specialMembership/RequestChangelogTimeline'`).

## Mocking & Architecture

- Mock Data: Must be imported from `.storybook/mockData/` folder, organized by model name:
  ```ts
  import { MockUserSpecialMembershipRequestReviews } from '.storybook/mockData/specialMembership'
  ```
  The `.storybook/*` import path is aliased in `tsconfig.app.json` — keep it as is, do NOT rewrite it to `@/`.
- MSW Integration: Import handlers from `.storybook/mswHandlers` and hook them up inside the story parameter object. Global default handlers already run via `msw-storybook-addon` configured in `.storybook/preview.ts`; story-level handlers override them:
  ```ts
  parameters: {
    msw: {
      handlers: [someHandler]
    }
  }
  ```
- Router-dependent views: mock routes with `storybook-vue3-router` using the `vueRouter()` decorator.

## Storybook Metadata Example

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MyComponent from './MyComponent.vue'
import type { MyComponentProps } from './MyComponent.vue'

const meta: Meta<typeof MyComponent> = {
  title: 'category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        MyComponent
      },
      template: `<MyComponent v-bind="args" />`
    }
  }
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    /* mock data here */
  } as MyComponentProps
}
```

## Verification Commands

After creating or editing stories, verify your changes:

```sh
npm run build-storybook  # Production build of Storybook (single run, use as CI check)
npm run lint:ci          # ESLint check only, no fixes, quiet output
npm run test:ci          # Vitest single run
```

- `npm run storybook` starts the dev server on port 6006 in watch mode — run it in the background for interactive preview, never as a blocking check.
- Stories must pass `npm run lint:ci` and the TypeScript check (`npm run type-check`).
