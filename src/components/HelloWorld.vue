<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
 
<div class="container mt-5">
  <form>
  <div class="mb-3">
    <h4 class="text-center">Iniciar sesión</h4>
    <label for="exampleInputEmail1" class="form-label">Usuario</label>
    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
    <div id="emailHelp" class="form-text"></div>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Wallet</label>
    <input type="password" class="form-control" id="exampleInputPassword1">
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1">
    <label class="form-check-label" for="exampleCheck1">Recordar</label>
  </div>
  <button style="position: relative;" type="submit" class="btn btn-primary">Iniciar sesión</button>
</form>
</div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
