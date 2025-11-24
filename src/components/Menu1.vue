<script setup>

</script>

<template>
  <div  class="container mt-5">
    <nav  class="navbar navbar-expand-lg bg-body-tertiary">
      <div style="background-color:cornflowerblue;" class="container-fluid">
        <a class="navbar-brand" href="#">Menú</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-link" href="">Comidas</a>
            <a class="nav-link" href="">Bebidas</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="mt-5">
      <h6 class="text-center">
        <strong>Eventos destacados</strong>
      </h6>

      <!-- Productos -->
      <div class="row">

      
        <!-- Evento principal-->
        <div class="col-md-4">
          <div class="card mt-4">
            <div class="card-header text-center">
          Reunión de Desarrolladores y Protocolo de Stellar
        </div>
        <div class="card-body">
          <img
            src="https://cdn.sanity.io/images/e2r40yh6/production-i18n/a6cf9884a1f741fb7fac4d134dbc7c7ee2fea0e0-3840x2360.png?rect=0,99,3840,2162&w=1224&h=689&auto=format"
            alt="Evento Stellar" class="img-fluid mb-3" style="max-width: 100%; height: auto;">
          <p>
            <strong>Fecha:</strong> 15 de noviembre de 2023<br>
            <strong>Hora:</strong> 10:00 AM - 4:00 PM<br>
            <strong>Lugar:</strong> Centro de Convenciones, Ciudad de México<br>
            <strong>Descripción:</strong> Un evento para desarrolladores y entusiastas del protocolo Stellar. Habrá
            charlas, talleres y oportunidades de networking.
          </p>
        </div>
          </div>
        </div>

        <!-- Evento secundario1-->
        <div class="col-md-4">
          <div class="card mt-4">
            <div class="card-header text-center">FWB Presenta FEST</div>
            <div class="card-body">
              <img src="https://cdn.sanity.io/images/e2r40yh6/production-i18n/7b212cc526274f89dd796ea07f2929def0f4aed5-4896x2756.png?w=1224&h=689&auto=format" 
              alt="" class="img-fluid" style="width: 100%; height: auto;">
              <p class="mt-2">
            <strong>Fecha:</strong> 16 de julio del 2025<br>
            <strong>Hora:</strong> 8:00 AM - 11:30 AM<br>
            <strong>Lugar:</strong> Centro de Convenciones, Ciudad de Brasil<br>
            <strong>Descripción:</strong> Un evento para desarrolladores y entusiastas del protocolo Stellar. Habrá
            charlas, talleres y oportunidades de networking.
              </p>
            </div>
          </div>
        </div>

        <!-- Pevento secundario2 -->
        <div class="col-md-4">
          <div class="card mt-4">
            <div class="card-header text-center">SDF en la Semana de Blockchain de Estambul</div>
            <div class="card-body">
              <img src="https://cdn.sanity.io/images/e2r40yh6/production-i18n/b89815490f18dea4751dbf6158ddd5d09681b279-4896x2756.png?w=1224&h=689&auto=format" 
              alt="img" class="img-fluid" style="width: 100%; height: auto;">
              <p class="mt-2">
           <strong>Fecha:</strong> 20 de junio del 2025<br>
            <strong>Hora:</strong> 9:00 AM - 10:30 PM<br>
            <strong>Lugar:</strong> Centro de Convenciones, Ciudad de Colombia<br>
            <strong>Descripción:</strong> Un evento para desarrolladores y entusiastas del protocolo Stellar. Habrá
            charlas, talleres y oportunidades de networking.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
