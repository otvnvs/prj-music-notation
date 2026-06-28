// Stores element mapping states keyed by their parent container element scopes
const registry = new Map();

function handleKeyDown(event) {
  if (!(event instanceof KeyboardEvent) || !event.altKey || event.ctrlKey || event.metaKey) return;

  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

  const pressedKey = event.key.toLowerCase();
  const physicalKey = event.code.replace(/^Key/, '').replace(/^Digit/, '').toLowerCase();

  // Search globally across all active registered container maps
  for (const shortcutMap of registry.values()) {
    const targetElement = shortcutMap.get(pressedKey) || shortcutMap.get(physicalKey);

    if (targetElement) {
      event.preventDefault();
      event.stopPropagation();
      targetElement.click();
      return; // Found and handled, stop searching
    }
  }
}

/**
 * Registers an isolated shortcut lookup table for a specific container tree context.
 * 
 * @param {HTMLElement} container - The container context node.
 * @param {Map<string, HTMLElement>} shortcutMap - The mapping configuration.
 */
export function registerContext(container, shortcutMap) {
  if (!container || !shortcutMap) return;
  
  registry.set(container, shortcutMap);

  // Bind the global handler once if it's the first time registering
  if (registry.size === 1) {
    window.addEventListener('keydown', handleKeyDown);
  }
}

/**
 * Clears and unregisters tracking hooks for a target container scope.
 * 
 * @param {HTMLElement} container - The layout context element.
 */
export function unregisterContext(container) {
  if (!container) return;
  
  registry.delete(container);

  // If no containers are registered, remove the global keydown listener
  if (registry.size === 0) {
    window.removeEventListener('keydown', handleKeyDown);
  }
}

