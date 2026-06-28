# Keyboard Provider Component (`index.vue`)

A Vue 3 structural wrapper component that handles the visual parsing of shortcut syntax (`&character` or `&amp;character`) within its slot content and synchronizes mappings to the underlying utility library.

## Mechanics
- **DOM Transformation**: Scans elements reactively, removes the `&` or `&amp;` indicator syntax, wraps the target key inside a `<u>` element, and adds a `data-shortcut` attribute.
- **Dynamic Observation**: Utilizes a `MutationObserver` instance to re-evaluate text content and update bindings when children or route contents change inside the slot.

---

## Usage

### 1. Main Layout Configuration (`Main.vue`)

Wrap your layout container or router views inside the provider to ensure all child nodes are scanned:

```vue
<template>
  <KeyboardProvider>
    <div class="app-container">
      <router-view></router-view>
    </div>
  </KeyboardProvider>
</template>

<script setup>
import KeyboardProvider from './components/keyboard/index.vue';
</script>
```

### 2. Child Element Syntax Example

Format target button or link text using an ampersand (`&`) directly preceding the designated hotkey character:

```vue
<template>
  <div class="page-view">
    <!-- Letter hotkey mapping (Triggers via Alt + J) -->
    <button @click="addMeasure" class="btn">
      Voeg maat by [&j]
    </button>

    <!-- Symbol hotkey mapping (Triggers via Alt + ;) -->
    <button @click="resetScore" class="btn">
      Herlaai [&;]
    </button>
    
    <!-- Link hotkey mapping (Triggers via Alt + H) -->
    <a href="#/help">Go to &Help</a>
  </div>
</template>
```

### Generated Output Structure

When evaluated by the component scanner, template markup changes as follows:

**Source Template:**
```html
<button class="btn">Voeg maat by [&j]</button>
```

**Compiled Runtime DOM:**
```html
<button class="btn" data-shortcut="j">Voeg maat by [<u>j</u>]</button>
```

