/**
 * Check if the active element is a text input field (input, textarea, or contenteditable)
 */
export function isTypingInTextInput(activeElement: Element | null): boolean {
  if (!activeElement) {
    return false
  }

  const tagName = activeElement.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea'
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true'

  // Check for specific input types that are not text-like
  const inputType = (activeElement as HTMLInputElement).type
  const isTextLikeInput = isInput && !['checkbox', 'radio', 'range', 'color', 'file', 'submit', 'button', 'image', 'reset'].includes(inputType)

  return isTextLikeInput || isContentEditable
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
