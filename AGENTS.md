## Structure of the project

This is a vite‑based Vue 3.x project using TypeScript. It is connected to a FeathersJS WebSocket backend, all services are available under `src/services/`.
The project has been migrated from vue 2 to vue 3 and from options API to composition API and from bootstrap 3 to bootstrap 5 at different level of completion. As a result, legacy code can still be found in some places.

The app is composed of two siblings vue apps:

- The main app located in `src/` served at `/app/`, with specific vue router base configuration located in `src/router/index.ts`
- The widget app located in `src/widget` served at `/widget/`, with specific vue router base configuration located in `src/widget/router/index.ts`
- Note that the widget app has its own internal components folder. Shared components between the main app and the widget app should be located in `src/components/` and imported in the widget app when needed.

There are some inconsistencies in the use of Vite aliases for imports, try to correct them when editing or use '@' whenever possible when creating new files.
Relevant part in `vite.config.ts`:

```ts
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '.storybook': fileURLToPath(new URL('./.storybook', import.meta.url))
      }
    },
```

The following conventions are used throughout the project:

- Source code is located in the `src/` directory.
- Vue components are located in the `src/components/` directory.
- Composables are located in the `src/composables/` directory.
- Pinia stores are located in the `src/stores/` directory.
- where applicable <i18n lang="json"> blocks are used for local component translations.
- generic or shared translations and specific number and date formatting are located in the `src/i18n` directory.

### Legacy code

src/assets/legacy contains css code from the previous bootstrap 3 implementation that is still in use in some parts of the app.
src/components/legacy/bootstrap contains vue3 components as we removed the vue-bootstrap dependency.

Must be reused when creating or editing app components:

- BDropdown component
- BFormInput component as it has a nice debounce implementation
- BFormCheckbox, as it has a nice `switch` property set

Deprecated legacy components:

- BCol and BRow: use plain bootstrap css classes instead.
- BAlert: prefer the version from 'impresso-ui-components/components/Alert.vue'

### External library `impresso-ui-components`

When creating a new component, check impresso-ui-components first. Do not wrap Bootstrap classes in new local components if a utility class suffices.
Vue3 components that are generic enough to be reused across multiple projects are located in the external library `impresso-ui-components`, which is a private npm package. When creating or editing components, prefer using components from this library when applicable:

- import Alert from 'impresso-ui-components/components/Alert.vue'
- import Modal from 'impresso-ui-components/components/legacy/BModal.vue' for bootstrap modals

### Use of services in components

Loading status: please import LoadingBlock from 'src/component/LoadingBlock.vue' and use a isLoading ref.

- use a separate function to fetch or load data from services.
- use async/await syntax.
- set isLoading to true before calling the service and to false in a finally block.

## Creating or editing Vue components

When generating or editing Vue components in src/components:

- Use the Composition API and ensure they are compatible with Vue 3.x.
- Prefer <script setup> syntax

- Ensure all new components have an accompanying Storybook 10.x story written in TypeScript.
- Create or update a Storybook 10.x story written in TypeScript.
- Place the story file in the same folder as the component (e.g. MyComponent.vue and MyComponent.stories.ts).
- types for models used from backend services are generated from schelmas and can be found in `src/models/generated/schemas.d.ts`. ContentItem typescript definitions, as it is a central model for the app, has a specific place in `src/models/generated/schemas/contentItem.d.ts`
- prefer typed objects to the model classes specified in `src/models/*.ts` unless there is a specific reason to use the class implementation.
- @/ is the preferred Vite alias to ensure import consistency.
- if a component requires specialized nested components that are not reused elsewhere, place both the main component and its nested components them in a subfolder named after the feature the component is solving (e.g. `src/components/barista` ). Storybook stories for these components should be placed in the same subfolder, following the usual rule.

### How to use i18n for dynamic translations in components

Never use the `useI18n` hook from 'vue-i18n' to access. Instead, use dynamic translation keys in the template section of the component.

- do not use $n, $t or useI18n in components, as the current implementation is very fragile. You can use $n $t and $tc for translation inside the <template> section only.
- for dynamic translations, use computed properties to build the translation key based on props or other reactive data.
- use JSON i18n blocks for local component translations, and define only English translations there. Do not define other languages in the component files.

Example:

```vue
<template>
  <div>
    <h1>{{ $t(computedTitleKey, { title: props.title }) }}</h1>
  </div>
</template>
<i18n lang="json">
{
  "en": {
    "title": {
      "text": "This is my title: {title}",
      "audio": "This is my audio title: {title}"
    }
  }
}
</i18n>
<script setup lang="ts">
import { computed } from 'vue'
export interface Props {
  title: string
  type: audio | text
}
const props = withDefaults(defineProps<Props>(), {
  title: 'My title',
  type: 'text'
})
const computedTitleKey = computed(() => {
  return `title.${props.type}`
})
</script>
```

### Example of component props definition in TypeScript with default values:

```ts
/**
 * Example of props definition for ListOfSimilarContentItems component
 */
export interface YourComponentProps {
  minHeight?: number
  contentClass?: string
}
const props = withDefaults(defineProps<YourComponentProps>(), {
  minHeight: 400,
  contentClass: 'col-12'
})
```

### Example of component storybook

As storybook 10.x is relatively new, here is an example of how our stories are composed.

- use always exported types from component props for args typing
- mockdata must be placed in `.storybook/mockData/`folder, preferably by model name.
- mockdata are mainly used by MSW handlers located in `.storybook/mswHandlers.ts` module
- even if we use feathersJS service, we use MSW to mock backend responses for storybook stories.
- prefer a template-based render function for better flexibility.

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MyComponent from './MyComponent.vue'
import type { MyComponentProps } from './MyComponent.vue'
import { getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'

const meta: Meta<typeof MyComponent> = {
  title: 'modals/MyComponent',
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
      template: `
        <div style="height: 500px; width: 100%">
            <MyComponent
              v-bind="args"
            />
        </div>
      `
    }
  },

  parameters: {
    msw: {
      handlers: [getMediaSourceHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: MockContentItemPublicDomain
  } as MyComponentProps
}
```

### Example of MSW handler for storybook

- use `get`, `find` or `create` methods from 'msw' http module to create handlers for storybook stories that mimic FeathersJS services.
- use plural for `find` handlers and singular for `get` handlers to follow FeathersJS conventions.
- preferably use `async` functions and add a convenient network delay simulation using `await new Promise(resolve => setTimeout(resolve, 500)) `
- mimic pagination in find functions correctly using request parameters

```ts
import { MockMediaSources } from './mockData/mediaSources'
import { http, HttpResponse } from 'msw'

export const getMediaSourceHandler = http.get('/api/media-sources/:id', async ({ params }) => {
  const { id } = params
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  return HttpResponse.json(MockMediaSources.find(source => source.uid === id) || null)
})

export const findMediaSourcesHandler = http.get('/api/media-sources', async ({ request }) => {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  const items = MockMediaSources.slice(offset, offset + limit)
  return HttpResponse.json({
    data: items,
    pagination: {
      total: MockMediaSources.length,
      offset: offset,
      limit: limit
    }
  } satisfies BaseFindResponse)
})
```

BaseFindResponse is defined in a separate type as:

```ts
export interface BaseFindResponse {
  data: unknown[]
  pagination: {
    /**
     * The total number of items matching the query
     */
    total: number
    /**
     * The number of items returned in this response
     */
    limit: number
    /**
     * Starting index of the items subset returned in this response
     */
    offset: number
  }
}
```

## Changelog and release notes

When generating release notes for a new tag, take the auto‑generated release notes for tag vX.Y.Z and rewrite them as:

- concise, but without bullet points whenever possible
- grouped into Features / Improvements / Bug fixes
- excluding chore/CI‑only changes
- written in full, nice sentences
