import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * A Vue composable that detects clicks outside a specified component.
 *
 * @param component - A Vue ref to the target element to monitor
 * @param callback - Function to execute when a click outside is detected
 * @param excludeComponent - A Vue ref to an element that should be excluded from click outside detection
 *
 * @throws {Error} If component ref is not provided
 * @throws {Error} If callback function is not provided
 *
 * @example
 * ```typescript
 * const dropdown = ref(null)
 * const trigger = ref(null)
 *
 * useClickOutside(dropdown, () => {
 *   console.log('Clicked outside!')
 * }, trigger)
 * ```
 *
 * @remarks
 * This hook automatically handles event listener cleanup on component unmount.
 * Can also be triggered programmatically using the `triggerClickOutside()` helper.
 */
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

  // Custom event listener for programmatic trigger
  const customListener = (event: CustomEvent) => {
    if (typeof callback === 'function') {
      callback(event)
    }
  }

  onMounted(() => {
    window.addEventListener('click', listener)
    window.addEventListener('trigger-click-outside', customListener as EventListener)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', listener)
    window.removeEventListener('trigger-click-outside', customListener as EventListener)
  })
}

/**
 * Programmatically triggers the click outside callback without requiring an actual DOM click.
 *
 * @param detail - Optional data to pass to the callback function
 *
 * @example
 * ```typescript
 * // Simple trigger
 * triggerClickOutside()
 *
 * // With custom data
 * triggerClickOutside({ reason: 'escape-key', source: 'keyboard' })
 * ```
 *
 * @remarks
 * This function dispatches a custom `trigger-click-outside` event on the window object.
 * All components using `useClickOutside` will receive this event and execute their callbacks.
 */
export function triggerClickOutside(detail?: any) {
  const event = new CustomEvent('trigger-click-outside', { detail })
  window.dispatchEvent(event)
}
