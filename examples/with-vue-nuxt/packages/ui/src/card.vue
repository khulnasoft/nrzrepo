<script lang="ts" setup>
const props = defineProps<{
  class?: string;
  title: string;
  href: string;
}>();
</script>

<template>
  <a
    :class="props.class"
    :href="`${props.href}?utm_source=create-nrz&utm_medium=basic&utm_campaign=create-nrz`"
    rel="noopener noreferrer"
    target="_blank"
  >
    <h2>{{ props.title }} <span>-&gt;</span></h2>

    <p><slot /></p>
  </a>
</template>
