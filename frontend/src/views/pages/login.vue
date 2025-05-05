<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Welcome to Heating Control</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input v-model="username" id="username" type="text" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="password" id="password" type="password" required />
        </div>

        <button type="submit">Login</button>

        <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()


const username = ref('')
const password = ref('')
const errorMessage = ref('')

function handleLogin() {
  if (username.value === 'admin' && password.value === 'admin') {
    //alert('Login successful!')
    router.push('/home') // Navigate to home on success
  } else {
    errorMessage.value = 'Invalid username or password.'
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f2f4f8, #dde6ed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', sans-serif;

}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-card h1 {
  margin-bottom: 24px;
  font-size: 1.8rem;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #0077cc;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #0077cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #005fa3;
}

.error-message {
  margin-top: 12px;
  color: #d9534f;
  font-size: 0.9rem;
}
</style>