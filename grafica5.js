// Define nombres de cada campo para tener etiquetas breves en la gráfica
const aspectosServicio = [
  { campo: "Trato y amabilidad", etiqueta: "Trato y amabilidad" },
  {
    campo: "Conocimiento del idioma utilizado por parte del personal",
    etiqueta: "Idioma del personal",
  },
  {
    campo: "Satisfacción con la información facilitada",
    etiqueta: "Información facilitada",
  },
  {
    campo: "Utilidad de la información facilitada",
    etiqueta: "Utilidad de la información",
  },
  {
    campo: "Tiempo de espera para ser atendido",
    etiqueta: "Tiempo de espera",
  },
  { campo: "Orden y limpieza", etiqueta: "Orden y limpieza" },
  {
    campo: "Localización de las instalaciones",
    etiqueta: "Localización de las instalaciones",
  },
  { campo: "Horario de atención al público", etiqueta: "Horario de atención" },
  { campo: "Contenido de los folletos", etiqueta: "Contenido de los folletos" },
];

function grafica5(registros, sexo) {
  // Filtra por sexo y cuenta los registros de cada grupo
  const contenedor = d3.select("#grafica5");
  const registrosFiltrados = registros.filter((registro) => registro.Sexo === sexo);
  const nombreSexo = sexo === "Mujer" ? "Mujeres" : "Hombres";
  const datos = aspectosServicio
    .map((aspecto) => {
      const puntuaciones = registrosFiltrados
        .map((registro) => {
          const respuesta = registro[aspecto.campo];
          return respuesta == null || String(respuesta).trim() === ""
            ? NaN
            : Number(respuesta);
        })
        .filter((puntuacion) => Number.isFinite(puntuacion) && puntuacion >= 0 && puntuacion <= 10);

      return {
        ...aspecto,
        cantidad: puntuaciones.length,
        media: d3.mean(puntuaciones),
      };
    })
    .filter((dato) => dato.cantidad > 0)
    .sort((a, b) => b.media - a.media);
  
  // Limpia la gráfica anterior antes de dibujar la nueva
  contenedor.selectAll("*").remove();

  if (datos.length === 0) {
    contenedor.append("div").style("padding", "24px").text("No hay puntuaciones disponibles.");
    return;
  }

  const ancho = contenedor.node().clientWidth;
  const alto = 430;
  const margen = { arriba: 75, derecha: 55, abajo: 45, izquierda: 210 };
  const altoGrafica = alto - margen.arriba - margen.abajo;

  // Crea el SVG con título y total de registros.
  const svg = contenedor
    .append("svg")
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      `Puntuación media de ${datos.length} aspectos del servicio para ${nombreSexo}, en una escala de 0 a 10`
    )
    .style("width", "100%")
    .style("height", `${alto}px`)
    .style("display", "block");

  svg
    .append("text")
    .attr("x", 20)
    .attr("y", 36)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .text(`Puntuación media por aspecto del servicio`);

  // Ubica las categorías en el eje vertical y convierte cantidades en el eje horizontal
  const escalaX = d3
    .scaleLinear()
    .domain([0, 10])
    .range([margen.izquierda, ancho - margen.derecha]);
  const escalaY = d3
    .scaleBand()
    .domain(datos.map((dato) => dato.etiqueta))
    .range([margen.arriba, alto - margen.abajo])
    .padding(0.3);

  const cuadricula = svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${alto - margen.abajo})`)
    .call(d3.axisBottom(escalaX).ticks(6).tickSize(-altoGrafica).tickFormat(""));

  cuadricula.select(".domain").remove();
  cuadricula
    .selectAll(".tick")
    .filter((_dato, indice, marcas) => indice === marcas.length - 1)
    .select("line")
    .remove();
  cuadricula.selectAll(".tick line")
    .attr("stroke", "#e2e8f0")
    .attr("stroke-dasharray", "3,3");

  const ejeY = svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margen.izquierda}, 0)`)
    .call(d3.axisLeft(escalaY));
  ejeY.select(".domain").attr("stroke", "#6b7280");
  ejeY.selectAll(".tick line").attr("stroke", "#6b7280");
  ejeY.selectAll(".tick text")
    .attr("fill", "#4b5563")
    .style("font-size", "12px");

  const ejeX = svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${alto - margen.abajo})`)
    .call(d3.axisBottom(escalaX).ticks(6))
    .call((eje) => eje.select(".domain").attr("stroke", "#6b7280"))
    .call((eje) => eje.selectAll(".tick line").attr("stroke", "#6b7280"))
    .call((eje) => eje.selectAll(".tick text").attr("fill", "#4b5563").style("font-size", "12px"));

  ejeX.append("text")
    .attr("x", (ancho - margen.izquierda - margen.derecha) / 2 + margen.izquierda)
    .attr("y", 38)
    .attr("fill", "#1e293b")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Puntuación media");

  // Dibuja una barra horizontal y su valor para cada campo
  const filas = svg
    .selectAll(".aspecto-servicio")
    .data(datos)
    .join("g")
    .attr("class", "aspecto-servicio");

  filas
    .append("rect")
    .attr("x", escalaX(0))
    .attr("y", (dato) => escalaY(dato.etiqueta))
    .attr("width", (dato) => escalaX(dato.media) - escalaX(0))
    .attr("height", escalaY.bandwidth())
    .attr("rx", 2)
    .attr("fill", "#78a99b");

  filas
    .append("text")
    .attr("x", (dato) => escalaX(dato.media) + 8)
    .attr("y", (dato) => escalaY(dato.etiqueta) + escalaY.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .attr("fill", "#374151")
    .text((dato) => dato.media.toFixed(1));
}