import { WidgetBaseUrl } from '@/constants'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { helpers, maxLength, required } from '@vuelidate/validators'

const routeParamsValidators = {
  contentItemId: {
    required,
    format: helpers.regex(/^[\w-]+$/)
  },
  alternativeTitle: {
    maxLength: maxLength(200),
    // letters in any script, digits and common punctuation, but no markup
    format: helpers.regex(/^[\p{L}\p{N}\s\-.,'"!?:;()&’–—]*$/u)
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    validators?: Record<string, Record<string, any>>
  }
}

const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

const propsFromRoute = ({ query, params }: RouteLocationNormalized) => ({
  contentItemId: String(params.contentItemId ?? ''),
  pageId: queryString(query.pageId),
  backgroundColor: queryString(query.backgroundColor),
  backgroundSize: queryString(query.backgroundSize),
  alternativeTitle: queryString(query.alternativeTitle),
  cssFilter: queryString(query.cssFilter),
  overlayBackgroundColor: queryString(query.overlayBackgroundColor),
  coordsMargin: queryString(query.coordsMargin),
  coords: queryString(query.coords),
  hideCitation: query.hideCitation === 'true'
})

const router = createRouter({
  history: createWebHistory(WidgetBaseUrl),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/ErrorView.vue')
    },
    {
      path: '/ci/:contentItemId',
      name: 'ContentItemViewer',
      component: () => import('../views/ContentItemViewer.vue'),
      props: propsFromRoute,
      meta: {
        validators: routeParamsValidators
      }
    },
    {
      // Legacy embed links generated before the widget used /ci/
      path: '/p/:pageId/a/:articleId/',
      name: 'ArticleViewer',
      redirect: to => ({
        name: 'ContentItemViewer',
        params: { contentItemId: to.params.articleId },
        query: { ...to.query, pageId: to.params.pageId }
      })
    },
    {
      path: '/p/:pageId/:coords/',
      name: 'StaticImage',
      component: () => import('../views/StaticImage.vue'),
      props: propsFromRoute
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('../views/ErrorView.vue'),
      props: { errorType: 'validation' }
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../views/ErrorView.vue')
    }
  ]
})

router.beforeEach(async to => {
  const validators = to.meta.validators
  if (!validators) return true

  const dataToValidate: Record<string, unknown> = {
    contentItemId: to.params.contentItemId,
    alternativeTitle: to.query.alternativeTitle ?? ''
  }

  const errorMessages: string[] = []
  for (const [field, rules] of Object.entries(validators)) {
    for (const [ruleName, rule] of Object.entries(rules)) {
      const validator = typeof rule === 'function' ? rule : rule?.$validator
      if (typeof validator === 'function' && !(await validator(dataToValidate[field]))) {
        errorMessages.push(`${field}: failed ${ruleName}`)
      }
    }
  }

  if (errorMessages.length) {
    console.warn('[widget/router] Validation failed:', errorMessages)
    return { name: 'Error' }
  }
  return true
})

export default router
