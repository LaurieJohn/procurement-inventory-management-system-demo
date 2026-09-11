<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
    <footer class="footer">
        <div class="row align-items-center justify-content-lg-between footer__row">
            <div class="col-lg-6">
                <div class="copyright text-center text-lg-left text-muted">
                    &copy; {{ year }} <strong>PIMS &mdash; Demo</strong>, made by
                    <strong>LaurieJohn</strong>. Sample data only.
                </div>
            </div>

            <div class="col-lg-6">
                <ul class="nav nav-footer justify-content-center justify-content-lg-end">
                    <li class="nav-item">
                        <a
                            href="https://ljar.vercel.app/"
                            class="nav-link footer__link"
                            target="_blank"
                            rel="noopener"
                        >
                            Visit my Portfolio
                        </a>
                    </li>

                    <li class="nav-item footer__divider">|</li>

                    <li class="nav-item">
                        <a
                            href="https://ljar.vercel.app/projects/pims"
                            class="nav-link footer__link"
                            target="_blank"
                            rel="noopener"
                        >
                            Read Case Study
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer__row {
    width: 98%;
    margin-left: auto;
    margin-right: auto;
}

/* The links are the point of a portfolio demo, so they get a real tap target
   and the brand colour. Argon paints every footer link muted grey from a
   selector that outranks a plain class, hence the override. */
.footer .nav-footer .footer__link {
    color: #0038a8 !important;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
}

.footer .nav-footer .footer__link:hover,
.footer .nav-footer .footer__link:focus {
    color: #1171ef !important;
    text-decoration: underline;
}

.footer__divider {
    display: flex;
    align-items: center;
    color: #ced4da;
}

@media (max-width: 991.98px) {
    /* Stacked on a phone, the two halves ran together and the credit line was
       easy to miss entirely. */
    .footer__row {
        width: 100%;
    }

    .copyright {
        font-size: 0.8125rem;
        line-height: 1.5;
    }

    .nav-footer {
        margin-top: 0.5rem;
    }
}
</style>
