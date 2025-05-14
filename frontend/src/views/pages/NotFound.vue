<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
</script>

<template>
    <FloatingConfigurator />
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <img src="@/assets/favicon.ico" alt="Logo" class="mx-auto h-16 mb-4" />

            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, #ff6660, transparent 60%) 10%, var(--surface-ground) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center"
                    style="border-radius: 53px">
                    <span class="text-[#ff6660] font-bold text-3xl">404</span>
                    <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Not Found</h1>
                    <div class="text-surface-600 dark:text-surface-200 mb-8">Requested resource is not available.</div>

                    <Button as="router-link" label="Go to Dashboard" to="/"
                        :style="{ backgroundColor: '#ff6600', color: 'white', border: 'none' }"></Button>
                </div>
            </div>
        </div>
    </div>
</template>
