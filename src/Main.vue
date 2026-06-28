<template>
  <KeyboardProvider>
	  <div class="minimal-container">
	    <router-view></router-view>
	  </div>
  </KeyboardProvider>
</template>
<script setup>
import KeyboardProvider from './components/keyboard/index.vue';
</script>
<style>
</style>
