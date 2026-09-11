<template>
    <div>
        <AdminSidebar />
        <SidenavBackdrop />

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
