import { type Ref, watch, nextTick } from 'vue'

export function useScrollToTop(
  targetRef: Ref<HTMLElement | null>,
  options: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {}
) {
  const { behavior = 'smooth', block = 'start' } = options

  const triggerScroll = () => {
    if (targetRef.value) {
      targetRef.value.scrollIntoView({ behavior, block })
      return
    }
    window.scrollTo({ top: 0, behavior })
  }

  return { triggerScroll }
}
