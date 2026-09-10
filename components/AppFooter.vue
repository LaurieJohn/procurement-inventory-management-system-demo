<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
    <footer class="footer">
        <div
            class="row align-items-center justify-content-lg-between"
            style="width: 98%; margin-left: auto; margin-right: auto"
        >
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
                            class="nav-link"
                            target="_blank"
                            rel="noopener"
                        >
                            Visit my Portfolio
                        </a>
                    </li>
                    |
                    <li class="nav-item">
                        <a
                            href="https://ljar.vercel.app/projects/pims"
                            class="nav-link"
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
