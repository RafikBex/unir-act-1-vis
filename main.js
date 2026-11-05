let registros = [];
let sexoSeleccionado = null;

// Función para representar las gráficas si hay sexo seleccionado
function actualizarGraficasDetalle() {
  if (!sexoSeleccionado) return;

  grafica2(registros, sexoSeleccionado);
  grafica3(registros, sexoSeleccionado);
  prepararygrafica4(registros, sexoSeleccionado);
  grafica5(registros, sexoSeleccionado);
}

// Función para seleccionar sexo y hacer aparecer las gráficas
function seleccionarSexo(sexo) {
  sexoSeleccionado = sexoSeleccionado === sexo ? null : sexo;
  d3.select("#graficasDetalle").classed("hidden", !sexoSeleccionado);
  grafica1(registros, sexoSeleccionado);
  actualizarGraficasDetalle();
}

document.addEventListener("DOMContentLoaded", cargarDatos);


// Función principal para cargar los datos y representar las gráficas
async function cargarDatos() {
  try {
    registros = await d3.json(
      "./300757-0-satisfaccion-atencion-visitante-json.json"
    );
    grafica1(registros, sexoSeleccionado);
    actualizarGraficasDetalle();

    // Adaptar el tamaño de las gráficas al minimizar o maximizar la pantalla
    window.addEventListener("resize", () => {
      window.requestAnimationFrame(() => {
        grafica1(registros, sexoSeleccionado);
        actualizarGraficasDetalle();
      });
    });
  } catch (error) {
    console.error("No se pudieron cargar los datos de las gráficas.", error);
    d3.select("#grafica1").text("No se pudieron cargar los datos.");
  }
}