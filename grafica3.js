const grupomes = ["01", "02", "03", "04","05","06","07","08","09","10","11","12"];
const coloresmes = [
  "#bde0a8", // enero - Verde menta
  "#e4c1f9", // febrero - Violeta
  "#fcf6bd", // marzo - Crema/Amarillo
  "#d0f4de", // abril - Verde claro
  "#ffadad",  // mayo - Coral suave
  "#a8dadc", // junio - Azul claro
  "#cdb4db", // julio - Lila
  "#ffc6ff", // agosto - Rosa suave
  "#ffd6a5", // setiembre - Melocotón
  "#fdffb6", // octubre - Amarillo suave
  "#caf0f8", // noviembe - Celeste
  "#bde0fe" // diciembre - Azul cielo
];
function grafica3(registros, sexo) {
  // Filtra por sexo y cuenta los registros de cada grupo por año
  const registrosFiltrados = registros.filter(
    (registro) => registro.Sexo === sexo
  );

  const datos = grupomes.map((mes, indice) => ({
    mes,
    cantidad: registrosFiltrados.filter(
      (registro) => 
        registro["Time End"] && 
        parseInt(registro["Time End"].split('/')[1], 10) === parseInt(mes, 10)
    ).length,
    color: coloresmes[indice],
  }));
  const ancho = 720;
  const alto = 420;
  const margen = { arriba: 75, derecha: 25, abajo: 65, izquierda: 60 };
  const anchoGrafica = ancho - margen.izquierda - margen.derecha;
  const altoGrafica = alto - margen.arriba - margen.abajo;
  const nombreSexo = sexo === "Mujer" ? "Mujeres" : "Hombres";
  const contenedor = d3.select("#grafica3");

  // Limpia la gráfica anterior antes de dibujar la nueva.
  contenedor.selectAll("*").remove();

  // Crea el SVG con título y total de registros.
  const svg = contenedor
    .append("svg")
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      `Cantidad de visitas por mes ${nombreSexo.toLowerCase()}`
    )
    .style("width", "100%")
    .style("height", "100%");

  svg
    .append("text")
    .attr("x", margen.izquierda)
    .attr("y", 34)
    .attr("font-size", 18)
    .attr("font-weight", "bold")
    .text(`Visitas por mes : ${nombreSexo}`);

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
    .domain(datos.map((dato) => dato.mes))
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
    .attr("x", (dato) => escalaX(dato.mes))
    .attr("y", (dato) => escalaY(dato.cantidad))
    .attr("width", escalaX.bandwidth())
    .attr("height", (dato) => escalaY(0) - escalaY(dato.cantidad))
    .attr("rx", 5)
    .attr("fill", (dato) => dato.color);

  barras
    .append("text")
    .attr("x", (dato) => escalaX(dato.mes) + escalaX.bandwidth() / 2)
    .attr("y", (dato) => escalaY(dato.cantidad) - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("font-weight", "bold")
    .attr("fill", "#374151")
    .text((dato) => dato.cantidad);
}
