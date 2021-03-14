<script context="module">
  import { register, waitLocale } from 'svelte-i18n';

  register('en', () => import('./messages/en.json'));
  register('pt-BR', () => import('./messages/pt-BR.json'));
  register('es-ES', () => import('./messages/es-ES.json'));
  register('ar', () => import('./messages/ar.json'));

  export async function preload( { path }) {
    await waitLocale();
    return { slug: path.slug}
  }
</script>

<script>
  import { _ } from 'svelte-i18n';
  export let slug
</script>

<style>
  .rtl {
    direction: rtl;
  }
</style>

<svelte:head>
  <title>{$_('about_this_site')}</title>
</svelte:head>

<div class={$_('direction')}>
  <h1>{$_('about_this_site')}</h1>
  <p>{$_('about_content.0')}</p>
  <p>path: {slug}</p>
</div>
