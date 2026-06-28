# Keyboard Shortcuts Utility Library (`index.js`)

A low-level module that manages an internal registry of shortcuts and attaches a single global keyboard listener to handle execution.

## API Reference

### `registerContext(container, shortcutMap)`
Registers a map of shortcuts linked to a specific container reference. If it is the first context registered, it attaches the global `keydown` event listener to the `window`.
* **`container`** (`HTMLElement`): The unique DOM node acting as the context key.
* **`shortcutMap`** (`Map<string, HTMLElement>`): A JavaScript Map where keys are lowercase shortcut characters and values are the target DOM elements to click.

### `unregisterContext(container)`
Removes the specified shortcut mapping context from the internal registry. If no registered contexts remain, it detaches the global listener from the `window`.
* **`container`** (`HTMLElement`): The DOM node context to remove.

---

## Standalone Usage Example

The library can be used independently of Vue if elements already have a defined `data-shortcut` attribute.

```html
<button data-shortcut="j">Save [J]</button>
<button data-shortcut=";">Reload [;]</button>
```

```javascript
import { registerContext, unregisterContext } from './index.js';

const customMap = new Map();
const elements = document.querySelectorAll('[data-shortcut]');

elements.forEach((el) => {
  const targetKey = el.getAttribute('data-shortcut');
  customMap.set(targetKey, el);
});

// Register the mappings against the document body context
registerContext(document.body, customMap);

// Cleanup statement when context is no longer needed
// unregisterContext(document.body);
```

