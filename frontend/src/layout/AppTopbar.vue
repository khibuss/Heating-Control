<script setup>
import { useLayout } from '@/layout/composables/layout';

const { toggleMenu } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <div class="layout-topbar-logo">
                <img src="../assets/favicon.ico" alt="Logo" class="h-8">

                <span>Heating Control</span>
            </div>
        </div>

    </div>
</template>
