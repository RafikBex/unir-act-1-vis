// Define las edades que aparecerán y el color de cada barra.
const gruposEdad = ["15-24", "25-44", "45-64", "+65"];
const coloresEdad = ["#a8dadc", "#cdb4db", "#ffd6a5", "#bde0a8"];

function grafica2(registros, sexo) {
  // Filtra por sexo y cuenta los registros de cada grupo de edad.
  const registrosFiltrados = registros.filter(
    (registro) => registro.Sexo === sexo
  );
  const datos = gruposEdad.map((edad, indice) => ({
    edad,
    cantidad: registrosFiltrados.filter((registro) => registro.Edad === edad)
      .length,
    color: coloresEdad[indice],
  }));
  const ancho = 720;
  const alto = 420;
  const margen = { arriba: 75, derecha: 25, abajo: 65, izquierda: 60 };
  const anchoGrafica = ancho - margen.izquierda - margen.derecha;
  const altoGrafica = alto - margen.arriba - margen.abajo;
  const nombreSexo = sexo === "Mujer" ? "Mujeres" : "Hombres";
  const contenedor = d3.select("#grafica2");

  // Limpia la gráfica anterior antes de dibujar la nueva.
  contenedor.selectAll("*").remove();

  // Crea el SVG con título y total de registros.
  const svg = contenedor
    .append("svg")
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      `Cantidad de registros por edad para ${nombreSexo.toLowerCase()}`
    )
    .style("width", "100%")
    .style("height", "100%");

  svg
    .append("text")
    .attr("x", margen.izquierda)
    .attr("y", 34)
    .attr("font-size", 18)
    .attr("font-weight", "bold")
    .text(`Distribución por edad: ${nombreSexo}`);

  svg
    .append("text")
    .attr("x", margen.izquierda)
    .attr("y", 56)
    .attr("font-size", 12)
    .attr("fill", "#6b7280")
    .text(`${registrosFiltrados.length} registros`);

  // Ubica las edades en horizontal y convierte cantidades en alturas.
  const escalaX = d3
    .scaleBand()
    .domain(datos.map((dato) => dato.edad))
    .range([margen.izquierda, ancho - margen.derecha])
    .padding(0.3);
  const escalaY = d3
    .scaleLinear()
    .domain([0, d3.max(datos, (dato) => dato.cantidad) || 1])
    .nice()
    .range([alto - margen.abajo, margen.arriba]);

  // Dibuja las categorías del eje horizontal.
  svg
    .append("g")
    .attr("transform", `translate(0, ${alto - margen.abajo})`)
    .call(d3.axisBottom(escalaX))
    .call((eje) => eje.select(".domain").attr("stroke", "#9ca3af"))
    .call((eje) => eje.selectAll(".tick text").attr("fill", "#4b5563"));

  const barras = svg
    .selectAll(".barra-edad")
    .data(datos)
    .join("g")
    .attr("class", "barra-edad");

  // Dibuja una barra vertical y su cantidad para cada grupo.
  barras
    .append("rect")
    .attr("x", (dato) => escalaX(dato.edad))
    .attr("y", (dato) => escalaY(dato.cantidad))
    .attr("width", escalaX.bandwidth())
    .attr("height", (dato) => escalaY(0) - escalaY(dato.cantidad))
    .attr("rx", 5)
    .attr("fill", (dato) => dato.color);

  barras
    .append("text")
    .attr("x", (dato) => escalaX(dato.edad) + escalaX.bandwidth() / 2)
    .attr("y", (dato) => escalaY(dato.cantidad) - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("font-weight", "bold")
    .attr("fill", "#374151")
    .text((dato) => dato.cantidad);
}
