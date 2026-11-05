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

function grafica1(registros, sexoSeleccionado = null) {
  const contenedor = d3.select("#grafica1");

  // Calcula el total de registros y los conteos por sexo.
  const resumen = contarRegistrosPorSexo(registros);

  // Prepara los datos que se mostrarán en las barras.
  const datos = [
    { sexo: "Hombre", etiqueta: "Hombres", cantidad: resumen.hombres, color: "#9ecae1" },
    { sexo: "Mujer", etiqueta: "Mujeres", cantidad: resumen.mujeres, color: "#f4a6b8" },
  ];

  // Define el tamaño de la gráfica y la escala de las barras.
  const ancho = 520;
  const alto = 250;

  const anchoContenedor = contenedor.node().clientWidth;

  const xBarra = 100;
  const margenDerecho = 70;
  const anchoBarra = anchoContenedor - xBarra - margenDerecho;
  const maximo = d3.max(datos, (dato) => dato.cantidad) || 1;
  const escala = d3.scaleLinear().domain([0, maximo]).range([0, anchoBarra]);
  

  // Limpia el contenedor antes de dibujar la gráfica.
  contenedor.selectAll("*").remove();

  // Crea el SVG y muestra el título y el total.
  const svg = contenedor
    .append("svg")
    .attr("role", "group")
    .attr(
      "aria-label",
      `Total de registros: ${resumen.total}. Hombres: ${resumen.hombres}. Mujeres: ${resumen.mujeres}.`
    )
    .style("width", "100%")
    .style("height", `${alto}px`)
    .style("display", "block");

  svg
    .append("text")
    .attr("x", 20)
    .attr("y", 40)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .text("Encuestados por sexo");

  // Dibuja una fila con una barra para cada sexo.
  const filas = svg
    .selectAll("g")
    .data(datos)
    .join("g")
    .attr("transform", (dato, indice) => `translate(0, ${32 + indice * 42})`)
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", (dato) => `Ver detalle de ${dato.etiqueta.toLowerCase()}`)
    .style("cursor", "pointer")
    // Al seleccionar una barra, actualiza el detalle por sexo.
    .on("click", (_evento, dato) => {
      seleccionarSexo(dato.sexo);
    })


  filas
    .append("text")
    .attr("x", 20)
    .attr("y", 72)
    .attr("font-size", 12)
    .text((dato) => dato.etiqueta);

  filas
    .append("rect")
    .attr("x", xBarra)
    .attr("y", 50)
    .attr("width", anchoBarra)
    .attr("height", 30)
    .attr("rx", 4)
    .attr("fill", "#e5e7eb");

  filas
    .append("rect")
    .attr("x", xBarra)
    .attr("y", 50)
    .attr("width", (dato) => escala(dato.cantidad))
    .attr("height", 30)
    .attr("rx", 4)
    .attr("fill", (dato) => dato.color);

  filas
    .append("text")
    .attr("x", (dato) => xBarra + escala(dato.cantidad) + 8)
    .attr("y", 72)
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text((dato) => dato.cantidad);

  svg
    .append("text")
    .attr("x", anchoContenedor / 2)
    .attr("y", alto - 20)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", "#9ca3af")
    .text(
      sexoSeleccionado
        ? `Presione las barras para ver detalle por sexo - ${sexoSeleccionado} ${sexoSeleccionado === "Mujer" ? "seleccionada" : "seleccionado"}`
        : "Presione las barras para ver detalle por sexo"
    );
}
