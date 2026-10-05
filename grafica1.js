function contarRegistrosPorSexo(registros) {
  // Cuenta el total de encuestados y los registros de cada sexo.
  return registros.reduce(
    (totales, registro) => {
      if (registro.Sexo === "Hombre") {
        totales.hombres += 1;
      } else if (registro.Sexo === "Mujer") {
        totales.mujeres += 1;
      }

      return totales;
    },
    { total: registros.length, hombres: 0, mujeres: 0 }
  );
}

function grafica1(registros) {
  // Calcula el total de registros y los conteos por sexo.
  const resumen = contarRegistrosPorSexo(registros);

  // Prepara los datos que se mostrarán en las barras.
  const datos = [
    { sexo: "Hombre", etiqueta: "Hombres", cantidad: resumen.hombres, color: "#9ecae1" },
    { sexo: "Mujer", etiqueta: "Mujeres", cantidad: resumen.mujeres, color: "#f4a6b8" },
  ];

  // Define el tamaño de la gráfica y la escala de las barras.
  const ancho = 520;
  const alto = 190;
  const xBarra = 100;
  const anchoBarra = 350;
  const maximo = d3.max(datos, (dato) => dato.cantidad) || 1;
  const escala = d3.scaleLinear().domain([0, maximo]).range([0, anchoBarra]);
  const contenedor = d3.select("#grafica1");

  // Limpia el contenedor antes de dibujar la gráfica.
  contenedor.selectAll("*").remove();

  // Crea el SVG y muestra el título y el total.
  const svg = contenedor
    .append("svg")
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("role", "group")
    .attr(
      "aria-label",
      `Total de registros: ${resumen.total}. Hombres: ${resumen.hombres}. Mujeres: ${resumen.mujeres}.`
    )
    .style("width", "100%")
    .style("height", "100%");

  svg
    .append("text")
    .attr("x", 20)
    .attr("y", 28)
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("Encuestados por sexo");

  svg
    .append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("font-size", 8)
    .text(`Total de registros: ${resumen.total}`);

  // Dibuja una fila con una barra para cada sexo.
  const filas = svg
    .selectAll("g")
    .data(datos)
    .join("g")
    .attr("transform", (dato, indice) => `translate(0, ${72 + indice * 42})`)
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", (dato) => `Ver detalle de ${dato.etiqueta.toLowerCase()}`)
    .style("cursor", "pointer")
    // Al seleccionar una barra, actualiza el detalle por sexo.
    .on("click", (_evento, dato) => grafica2(registros, dato.sexo))

  filas
    .append("text")
    .attr("x", 20)
    .attr("y", 16)
    .attr("font-size", 14)
    .text((dato) => dato.etiqueta);

  filas
    .append("rect")
    .attr("x", xBarra)
    .attr("y", 0)
    .attr("width", anchoBarra)
    .attr("height", 22)
    .attr("rx", 4)
    .attr("fill", "#e5e7eb");

  filas
    .append("rect")
    .attr("x", xBarra)
    .attr("y", 0)
    .attr("width", (dato) => escala(dato.cantidad))
    .attr("height", 22)
    .attr("rx", 4)
    .attr("fill", (dato) => dato.color);

  filas
    .append("text")
    .attr("x", (dato) => xBarra + escala(dato.cantidad) + 8)
    .attr("y", 16)
    .attr("font-size", 14)
    .attr("font-weight", "bold")
    .text((dato) => dato.cantidad);

  svg
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", alto - 4)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", "#9ca3af")
    .text("Presione las barras para ver detalle por sexo");
}