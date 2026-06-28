<template>
  <div ref="shortcutContainer">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { registerContext, unregisterContext } from '../../lib/keyboard/index.js';

const shortcutContainer = ref(null);
let mutationObserver = null;
let scanTimeout = null;

function scanAndProcessDOM() {
  if (!shortcutContainer.value) return;

  const localMap = new Map();
  const clickableElements = shortcutContainer.value.querySelectorAll('button, a');

  clickableElements.forEach((element) => {
    let shortcutChar = element.getAttribute('data-shortcut');

    if (!shortcutChar) {
      const rawHtml = element.innerHTML || '';
      const match = rawHtml.match(/&(?:amp;)?(\S)/i);

      if (match) {
        const fullMatchString = match[0];
        const targetChar = match[1];
        shortcutChar = targetChar.toLowerCase();

        element.innerHTML = rawHtml.replace(fullMatchString, `<u>${targetChar}</u>`);
        element.setAttribute('data-shortcut', shortcutChar);
      } else {
        const rawTitle = element.getAttribute('title') || '';
        const titleMatch = rawTitle.match(/&(?:amp;)?(\S)/i);

        if (titleMatch) {
          // FIX: Correctly extract match array indices
          const fullMatchString = titleMatch[0];
          const targetChar = titleMatch[1];
          shortcutChar = targetChar.toLowerCase();

          element.setAttribute('title', rawTitle.replace(fullMatchString, targetChar));
          element.setAttribute('data-shortcut', shortcutChar);
        }
      }
    }

    if (shortcutChar) {
      localMap.set(shortcutChar, element);
    }
  });

  registerContext(shortcutContainer.value, localMap);
}

onMounted(() => {
  if (shortcutContainer.value) {
    setTimeout(() => {
      scanAndProcessDOM();
    }, 0);

    mutationObserver = new MutationObserver(() => {
      // FIX: Add a brief timeout to let Vue finish rendering active template swaps
      clearTimeout(scanTimeout);
      scanTimeout = setTimeout(() => {
        scanAndProcessDOM();
      }, 20);
    });

    mutationObserver.observe(shortcutContainer.value, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true, // Crucial for catching changes to titles
      attributeFilter: ['title']
    });
  }
});

onUnmounted(() => {
  clearTimeout(scanTimeout);
  if (shortcutContainer.value) {
    unregisterContext(shortcutContainer.value);
  }
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
});
</script>

