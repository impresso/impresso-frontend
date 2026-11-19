---
name: develop-and-edit-app-components
description: Create and edit Vue 3 components in impresso-frontend following strict architectural rules — Composition API with <script setup lang="ts">, TypeScript, Bootstrap 5, impresso-ui-components, Pinia stores, typed emits, i18n. Includes ESLint and test commands.
---

You are a Senior Vue 3 & TypeScript engineer. Your job is to create and edit Vue 3 components based on strict architectural rules.

## Core Project Rules

- Framework: Vite-based Vue 3.x, TypeScript, Bootstrap 5.
- Target Syntax: Composition API with `<script setup lang="ts">` exclusively.
- HTML Elements: Use CamelCase for component names in templates. Kebab-case ONLY for custom layout plugin components (`<i-layout>`).
- Imports & Pathing: Use the `@/` Vite alias for all project source files to maintain consistency.
- External Library: Check `impresso-ui-components` first. Do NOT wrap Bootstrap classes in new local components if a utility class suffices.
  - Import Alert: `import Alert from 'impresso-ui-components/components/Alert.vue'`
  - Import Modal: `import Modal from 'impresso-ui-components/components/legacy/BModal.vue'`

## Legacy Code Rules

- Allowed Legacy Components: `BDropdown`, `BFormInput` (for debounce), `BFormCheckbox` (with `switch` property).
- Forbidden Legacy Components: Do NOT use `BCol`, `BRow` (use plain CSS classes), or `BAlert`.

## Service & Pinia Integration

- Always integrate Pinia stores from `src/stores/` cleanly using standard Vue 3 reactivity.
- Loading states: Import `LoadingBlock` from `@/components/LoadingBlock.vue`. Use an `isLoading` ref.
- Fetching data: Use a separate `async/await` function. Set `isLoading.value = true` before the call, and `false` in a `finally` block.
- Models: Use generated schemas from `src/models/generated/schemas.d.ts` (or `contentItem.d.ts`). Prefer typed objects over model classes unless explicitly requested.

## Components Emits & i18n

- Emits must be strictly typed:
  ```ts
  const emit = defineEmits<{
    (e: 'change', id: number): void
  }>()
  ```
- i18n: NEVER use useI18n() hook. Use $t() inside <template> only. For dynamic keys, use computed keys based on props/reactive state.

- Local translations must use <i18n lang="json"> blocks containing ONLY English ("en") translations.

## Verification Commands

After creating or editing components, verify your changes:

```sh
npm run lint        # ESLint over the whole repo, with --fix (auto-fixes style issues)
npm run lint:ci     # ESLint check only, no fixes, quiet output
npm run test:ci     # Vitest single run, exits when done (use this, NOT `npm run test`)
```

- Run `npm run lint` first to auto-fix, then `npm run lint:ci` to confirm a clean pass.
- Use `npm run test:ci` for tests. `npm run test` starts Vitest in watch mode and never exits on its own.
- For a full TypeScript check, `npm run type-check` (vue-tsc) is also available.
