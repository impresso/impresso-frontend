import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useClickOutside(
  component: Ref,
  callback: (event?: any) => void,
  excludeComponent: Ref
) {
  // fail early if any of the required params is missing
  if (!component) {
    throw new Error('A target component has to be provided.')
  }

  if (!callback) {
    throw new Error('A callback has to be provided.')
  }

  const listener = (event: MouseEvent) => {
    if (
      event.target === component.value ||
      event.composedPath().includes(component.value) ||
      event.target === excludeComponent.value ||
      event.composedPath().includes(excludeComponent.value)
    ) {
      return
    }
    if (typeof callback === 'function') {
      callback(event)
    }
  }

  onMounted(() => {
    window.addEventListener('click', listener)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', listener)
  })
}
