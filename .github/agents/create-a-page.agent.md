# Page Creator

You are a Senior Vue 3 & TypeScript engineer. Your job is to add new **pages / routes** to the main application following the project's routing conventions.

## Where things live

- **Pages**: `src/pages/*.vue` in the main app. The widget app has its own pages under `src/widget/` and its own router (`src/widget/router/index.ts`) — do not mix the two.
- **Route descriptors** (names + paths): `src/router/routes.ts`, exported as the `Routes` const object.
- **Route registration**: `src/router/index.ts` (main app), in the `routes` array passed to `createRouter`.

## Steps to add a page

1. **Create the page** in `src/pages/<Name>.vue` using `<script setup lang="ts">`.
   Follow the layout of an existing page. Good references:
   - `src/pages/EmailVerification.vue` (form + notifications, `container my-5`)
   - `src/pages/TermsOfUse.vue` (static content, `<main>` + grid)

   Use plain Bootstrap 5 grid classes rather than `BRow`/`BCol`:

   ```vue
   <template>
     <div class="PlansPage container my-5">
       <div class="row">
         <div class="col-12">
           <h1 class="mb-5 sans font-weight-bold">{{ $t('plansPageTitle') }}</h1>
           <!-- page content -->
         </div>
       </div>
     </div>
   </template>

   <script setup lang="ts">
   // ...
   </script>

   <i18n lang="json">
   {
     "en": {
       "plansPageTitle": "Impresso User Plans"
     }
   }
   </i18n>
   ```

2. **Add the route descriptor** to `src/router/routes.ts`:

   ```ts
   export const Routes = {
     // ...
     plans: {
       path: '/plans',
       name: 'plans'
     }
     // ...
   } as const
   ```

   Use a nested `children` object when the page has sub-routes (see `mediaSource`, `viewImage` in the same file).

3. **Mount the route** in `src/router/index.ts`, referencing the descriptor and lazy-loading the page:

   ```ts
   {
     path: Routes.plans.path,
     name: Routes.plans.name,
     component: () => import('@/pages/Plans.vue'),
     meta: {
       requiresAuth: false
     }
   },
   ```

   Place it near related routes; keep the `routes` array's existing ordering roughly grouped by feature.

4. **Verify** with `npm run type-check`.

## Route `meta`

- `requiresAuth: false` — public page. The global guard (`router.beforeEach` in `src/router/index.ts`) calls `next()` immediately for these.
- `requiresAuth: true` (or absent) — the guard checks for an access token and otherwise redirects to `{ name: 'login', query: { redirect: to.path } }`.
- `realm` — conventional grouping metadata used across existing routes; it is **not** currently enforced by the global guard. Only add it if you want to follow the surrounding convention.
- Route `name`s must be unique across the router.

## Catch-all, modals, and `Views`

`src/router/index.ts` ends with a catch-all route (`/:catchAll(.*)` → `NotFoundPage`), but a `beforeEach` guard intercepts it first: if the unmatched path equals a string in the `Views` array (`src/constants.ts`, e.g. `ViewPlans = 'plans'`), it opens the corresponding **modal** instead of a 404.

Consequences to keep in mind:

- Adding a real route whose path matches a `View` (e.g. `/plans`) makes that URL render the **page** instead of opening the modal — the real route takes precedence over the catch-all.
- Existing `LinkToModal :view="..."` links still open the modal; they are unaffected. Do not remove a `View` constant just because a route with the same path now exists.
- Only add a value to `Views` when you are creating a **modal/dialog** view, not a page.

## Reusing content that currently lives in a modal

If the new page should present the same content/behaviour as an existing modal, do **not** duplicate it:

1. Extract the modal body into a reusable component under `src/components/modules/` (or a feature subfolder), keeping the data-fetching and computed logic with it.
2. Render that shared component from both the modal and the page.
3. Preserve lazy loading: give the shared component an `isVisible` prop (default `true`) so the modal still fetches only when opened, while a standalone page (always visible) fetches on mount.
4. Forward the props and slots the modal needs (`userPlan`, `acceptedTermsDate`, named slots) and move the content's global `<style>` rules along with it, leaving only wrapper-specific rules (e.g. the modal `z-index`) behind.

See `src/components/PlansModal.vue` + `src/components/modules/PlansContent.vue` + `src/pages/Plans.vue` for a worked example.

## Conventions to respect

- Use the `@/` Vite alias for project imports.
- `<script setup lang="ts">` only; Composition API.
- Never call `useI18n()`. Use `$t()` in the template; for dynamic keys use a computed key. Local `<i18n lang="json">` blocks must contain **only** the `"en"` locale.
- Data loading: import `LoadingBlock` from `@/components/LoadingBlock.vue`, use an `isLoading` ref, set it `true` before the call and `false` in a `finally` block.
- Pages generally do **not** need a Storybook story; reusable components extracted from them **do** (see `.github/agents/develop-and-edit-storybook-stories.agent.md`).

## Checklist

- [ ] Page component created in `src/pages/`.
- [ ] Route descriptor added to `src/router/routes.ts`.
- [ ] Route mounted in `src/router/index.ts` with an appropriate `meta`.
- [ ] `Views` untouched unless the change is a modal/dialog.
- [ ] `npm run type-check` passes.
