import { WidgetBaseUrl } from '@/constants'
import { createRouter, createWebHistory } from 'vue-router'
import { ValidationRule } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'

const routeParamsValidators = {
  backgroundColor: {
    // naming the rule 'format' or 'hex'
    format: helpers.regex(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[a-z]+)$/)
  },
  contentItemId: {
    required,
    format: helpers.regex(/^[a-zA-Z0-9\-]+$/)
  },
  alternativeTitle: {
    maxLength: helpers.len(100),
    format: helpers.regex(/^[\w\s\-.,'"]*$/)
  }
}
// Extend the RouteMeta interface
declare module 'vue-router' {
  interface RouteMeta {
    requiresValidation?: boolean
    // Changed from ValidationRule to a nested object structure
    validators?: Record<string, Record<string, any>>
  }
}

const propsFromRoute = ({ query, params }) => ({
  backgroundColor: query.backgroundColor,
  backgroundSize: query.backgroundSize,
  alternativeTitle: query.alternativeTitle,
  cssFilter: query.cssFilter,
  overlayBackgroundColor: query.overlayBackgroundColor,
  coordsMargin: query.coordsMargin,
  coords: query.coords,
  contentItemId: params?.contentItemId
})

const router = createRouter({
  history: createWebHistory(WidgetBaseUrl),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/About.vue')
    },
    {
      path: '/test/:path',
      name: 'TestFrame',
      component: () => import('../views/TestFrame.vue')
    },
    {
      path: '/p/:pageUid/:coords/',
      name: 'StaticImage',
      component: () => import('../views/StaticImage.vue'),
      props: propsFromRoute
    },
    {
      path: '/ci/:contentItemId',
      name: 'ContentItemViewer',
      component: () => import('../views/ContentItemViewer.vue'),
      beforeEnter: (to, from, next) => {
        const { contentItemId } = to.params
        // content item id is "-" separated string, e.g., "ci-12345". Check with regex
        if (!/^[a-zA-Z0-9\-]+$/.test(String(contentItemId))) {
          console.warn(
            `[router] Invalid contentItemId format: ${contentItemId}. Redirecting to NotFound.`
          )
          next({ name: 'NotFound' })
        } else {
          next()
        }
      },
      props: propsFromRoute,
      meta: {
        validators: {
          contentItemId: routeParamsValidators.contentItemId,
          backgroundColor: routeParamsValidators.backgroundColor
        }
      }
    },
    {
      path: '/p/:pageUid/a/:articleUid/',
      name: 'ArticleViewer',
      component: () => import('../views/ArticleViewer.vue'),
      props: propsFromRoute
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/About.vue')
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../views/About.vue')
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('../views/ErrorView.vue')
    }
  ]
})
router.beforeEach(async (to, from, next) => {
  const validators = to.meta.validators
  if (!validators) return next()

  const dataToValidate = {
    contentItemId: to.params.contentItemId,
    backgroundColor: to.query.backgroundColor
  }

  let isValid = true
  const errorMessages: string[] = []
  console.log(validators)
  // Manually iterate through the validators defined in meta
  for (const [field, rules] of Object.entries(validators)) {
    const value = dataToValidate[field as keyof typeof dataToValidate]

    console.debug(`[router] Validating field: ${field} with rules:`, rules, value)
    // Each rule in the validators object (e.g., 'required', 'format')
    for (const [ruleName, ruleFunc] of Object.entries(rules as any)) {
      // Vuelidate rules are functions that return boolean or a promise
      if (typeof ruleFunc === 'function') {
        const result = await ruleFunc(value)
        if (!result) {
          isValid = false
          errorMessages.push(`${field}: Failed ${ruleName}`)
        }
      }
    }
  }

  if (!isValid) {
    console.warn('[router] Validation failed:', errorMessages)
    return next({
      name: 'Error',
      query: { message: errorMessages.join(', ') }
    })
  }

  next()
})

export default router
