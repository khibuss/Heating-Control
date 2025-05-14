<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import api from '@/utils/api';
import { ref } from 'vue';
import { useRouter } from "vue-router";


const router = useRouter();
const username = ref('');
const password = ref('');
const checked = ref(false);
const error = ref();  // Here we print errors and eventually show.

const handleLogin = async () => {
    try {
        const response = await api.post('/login', {
            username: username.value,
            password: password.value
        });

        const token = response.data.token;

        if (!token) {
            throw new Error('Token mancante nella risposta del server');
        }

        localStorage.setItem('admin_token', token);

        router.push('/');
    } catch (err) {
        console.error('Errore login:', err.message);
        error.value = err.response?.data?.message || err.message || 'Errore sconosciuto';
    }
};

</script>

<template>
    <FloatingConfigurator />
    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #ff6660 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img src="@/assets/favicon.ico" alt="Logo" class="mx-auto h-16 mb-4" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                            Welcome to Heating Control!
                        </div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>
                    <div>
                        <label for="username"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username</label>
                        <InputText id="username" type="text" placeholder="Username" class="w-full md:w-[30rem] mb-8"
                            v-model="username" />

                        <label for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true"
                            class="mb-4" fluid :feedback="false"></Password>


                        <Button label="Sign In" class="w-full my-6"
                            :style="{ backgroundColor: '#ff6666', color: 'white', border: 'none' }"
                            @click="handleLogin"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>