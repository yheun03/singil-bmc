<template>
    <div class="site-layout">
        <SiteHeader />
        <main class="site-layout__main">
            <slot />
        </main>
        <SiteFooter />
    </div>
</template>

<style lang="scss">
@use '~/assets/scss/site/index';
</style>
