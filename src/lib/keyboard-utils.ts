/**
 * Utility functions for keyboard event handling
 */

/**
 * Check if the user is currently typing in a text input field
 * @param activeElement - The currently focused element (usually document.activeElement)
 * @returns true if the user is typing in a text field, false otherwise
 */
export function isTypingInTextInput(activeElement: Element | null): boolean {
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea'
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true'
  
  // Check for specific input types that should allow text input
  if (isInput) {
    const inputType = (activeElement as HTMLInputElement).type?.toLowerCase()
    const textInputTypes = [
      'text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 
      'datetime-local', 'month', 'time', 'week', 'color'
    ]
    return textInputTypes.includes(inputType || 'text')
  }
  
  return isContentEditable
}

/**
 * Check if a keyboard event should be handled by global shortcuts
 * @returns true if the event should be handled, false if user is typing
 */
export function shouldHandleGlobalShortcut(): boolean {
  return !isTypingInTextInput(document.activeElement)
}

/**
 * Common keyboard shortcuts that should be prevented when typing
 */
export const GLOBAL_SHORTCUT_KEYS = [
  'ArrowUp',
  'ArrowDown', 
  'ArrowLeft',
  'ArrowRight',
  'Delete',
  'Backspace',
  'Enter',
  'Escape'
] as const

/**
 * Check if a key is a global shortcut that should be prevented when typing
 * @param key - The keyboard key
 * @returns true if it's a global shortcut key
 */
export function isGlobalShortcutKey(key: string): boolean {
  return GLOBAL_SHORTCUT_KEYS.includes(key as typeof GLOBAL_SHORTCUT_KEYS[number])
}
