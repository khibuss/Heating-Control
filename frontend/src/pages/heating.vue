<script setup></script>

<template>
    <header>
        <div class="info">
        <h1 class="title">HEATING CONTROL 🔥</h1>
        <p class="description">
          Thanks to our service, you can monitor the temperature inside your rooms and use our automatic on/off controls to keep your environment warm.
        </p>
      </div>
    </header>
    
    <main>
      <section class="temperature-bar">
        <!-- Qua mettiamo i vari componenti di ciascuna temperatura -->
        <!-- Temperature andra rimosso e sostituito con un comp-->
        <div class="temperature">
            <p>Salotto</p>
            <p>26 gradi</p>
            <p>Umidità 24</p>
        </div>
        <div class="temperature">
            <p>Cucina</p>
            <p>26 gradi</p>
            <p>Umidità 24</p>
        </div>
        <div class="temperature">
            
        </div>
      </section>
    </main>
    <footer>    </footer>
</template>

<style scoped>

* {
  box-sizing: border-box;
  border: 1px solid red;  /* Per visualizzare i margini */
  padding: 0;
  margin: 0;
}
body{
  background-color: blueviolet;
}

/* HEADER */
header {
    background-color:burlywood;
    margin: 0;
    padding: 0;
}

.description, .title {
    padding: 10px;
}

.title {
  font-size: 2rem;
  font-family: 'Courier New', Courier, monospace;
}

.description {
  font-size: 1rem;
  color: #555;
  font-family: 'Courier New', Courier, monospace;

}
/* MAIN */
.temperature-bar {
    display:flex;
}
.temperature {
    background-color:blue ;
    padding: 40px;
}
footer{
    padding: 10px;
}
</style>
