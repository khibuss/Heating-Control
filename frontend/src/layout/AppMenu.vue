<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter to handle navigation
import AppMenuItem from './AppMenuItem.vue';

const router = useRouter(); // Use the useRouter function

const model = ref([
    {
        label: 'Views',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Configurazione', icon: 'pi pi-fw pi-cog', to: '/config' }
        ]
    }
]);

// Logout method to clear token and redirect
function logout() {
    localStorage.removeItem('admin_token');  // Remove the token
    router.push({ name: 'login' });           // Use router.push() to redirect to the login page
}
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
    <!-- Add a logout button at the bottom -->
    <div class="logout-container">
        <button @click="logout"
            class="logout-btn bg-red-500 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
            Logout
        </button>
    </div>
</template>

<style lang="scss" scoped>
.logout-container {
    display: flex;
    justify-content: center;
    margin-top: 600px;
}

.logout-btn {
    width: 100%;
    /* Make the button full width */
    padding: 10px;
    font-size: 16px;
    border-radius: 8px;
    cursor: pointer;
}
</style>
