document.addEventListener("DOMContentLoaded", cargarDatos);

async function cargarDatos() {
  try {
    const registros = await d3.json(
      "./300757-0-satisfaccion-atencion-visitante-json.json"
    );
    grafica1(registros);
    grafica2(registros, "Hombre");
  } catch (error) {
    console.error("No se pudieron cargar los datos de las gráficas.", error);
    d3.select("#grafica1").text("No se pudieron cargar los datos.");
  }
}