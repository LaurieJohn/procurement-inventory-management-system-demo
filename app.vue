<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>

        <!-- Outside the layout, so it survives moving between the requester
             pages and the administration console and is raised once per visit. -->
        <DemoNotice />
    </div>
</template>
