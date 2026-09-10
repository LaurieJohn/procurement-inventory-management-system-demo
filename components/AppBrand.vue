<script setup lang="ts">
/**
 * The sidebar brand.
 *
 * This is a portfolio demo, not any organisation's system, so it carries no
 * agency logo — just the module it demonstrates and who built it. The cart
 * stands on its own rather than sitting in a tinted tile, which reads as a mark
 * rather than as a placeholder.
 */
</script>

<template>
    <div class="brand">
        <i class="ni ni-cart brand__mark" aria-hidden="true"></i>

        <span class="brand__text">
            <span class="brand__name">PIMS</span>
            <span class="brand__tag">Demo by LaurieJohn</span>
        </span>
    </div>
</template>

<style scoped>
.brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    /* Vertical only — the sidebar header supplies the horizontal padding, so
       the brand and the toggler beside it stay on the same inset. */
    padding: 1rem 0;
}

.brand__mark {
    flex: 0 0 auto;
    font-size: 1.75rem;
    line-height: 1;
    color: #0038a8;
}

.brand__text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    /* The compact sidebar narrows to the icon rail, so the words are clipped
       rather than allowed to wrap the brand onto a second line. */
    overflow: hidden;
    white-space: nowrap;
}

.brand__name {
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #32325d;
}

.brand__tag {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8898aa;
}
</style>
