<template>
    <div>
        <AppSidebar />

        <div id="panel" class="main-content">
            <AppNavbar />

            <main>
                <slot />
            </main>

            <AppFooter />
        </div>

        <PimsModal />
    </div>
</template>
