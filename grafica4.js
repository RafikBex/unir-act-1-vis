// 1. TRANSFORMACIÓN Y FILTRADO DE DATOS
function prepararDatosParaGrafica(jsoncrudo, sexo) {
  if (!jsoncrudo || !Array.isArray(jsoncrudo)) return [];

  const nombreSexo = sexo === "Mujer" ? "Mujeres" : "Hombres";

  // Filtrar el JSON por el campo 'Sexo' exacto
  const jsoncrudoFiltrado = jsoncrudo.filter(item => item.Sexo === sexo);

  const conteo = {};
  const visitantesPorServicio = {};

  jsoncrudoFiltrado.forEach(item => {
    // Claves exactas del dataset original
    const servicioRaw = item["¿Qué instalaciones del Servicio de Atención e Información Turística ha visitado? (Seleccione todas las opciones que correspondan)"];
    const satisfaccionRaw = item["¿Cuál es su nivel global de satisfacción con el Servicio de Atención e Información Turística?"];

    if (!servicioRaw || servicioRaw.trim() === "") return;
    const servicio = servicioRaw.trim();

    // Restricción: Omitir "Sin especificar"
    if (servicio.toLowerCase() === "sin especificar") return;

    // Omitir vacíos o 'NS/NC' / 'Sin respuesta'
    if (!satisfaccionRaw || satisfaccionRaw === "NS/NC" || satisfaccionRaw.trim() === "") return;

    const satisfaccion = satisfaccionRaw.trim();
    const clave = `${servicio}||${satisfaccion}`;

    if (!conteo[clave]) {
      conteo[clave] = {
        tipo_servicio: servicio,
        nivel_satisfaccion: satisfaccion,
        cantidad: 0
      };
    }
    conteo[clave].cantidad += 1;

    // Contar para saber si el servicio tiene al menos 5 visitantes
    visitantesPorServicio[servicio] = (visitantesPorServicio[servicio] || 0) + 1;
  });

  // Filtrar servicios con al menos 5 visitantes y ordenar alfabéticamente los servicios visitados
  return Object.values(conteo)
    .filter(item => visitantesPorServicio[item.tipo_servicio] >= 5)
    .sort((a, b) => a.tipo_servicio.localeCompare(b.tipo_servicio, 'es', { sensitivity: 'base' }));
}

function grafica4(registros, sexo) {
  const contenedor = d3.select("#grafica4");
  contenedor.selectAll("*").remove();

  if (!registros || registros.length === 0) {
    contenedor.append("div")
      .style("padding", "30px")
      .style("text-align", "center")
      .style("color", "#64748b")
      .html(`<strong>No hay registros disponibles para ${sexo}</strong>`);
    return;
  }

  // 1. Dimensiones de lienzo interno
  const ancho = contenedor.node().clientWidth;
  const alto = 500;
  
  // Márgenes optimizados para evitar cortes
  const margen = { arriba: 50, derecha: 140, abajo: 50, izquierda: 210 };
  const anchoGrafica = ancho - margen.izquierda - margen.derecha;
  const altoGrafica = alto - margen.arriba - margen.abajo;

  // 2. Creación de SVG Escalable con viewBox
  const svg = contenedor
    .append("svg")
    .attr("viewBox", `0 0 ${ancho} ${alto}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", `${alto}px`)
    .style("display", "block")
    .append("g")
    .attr("transform", `translate(${margen.izquierda},${margen.arriba})`);

  // Dominios únicos
  const tiposServicio = Array.from(new Set(registros.map(d => d.tipo_servicio)));
  
  const nivelesSatisfaccion = Array.from(new Set(registros.map(d => d.nivel_satisfaccion)))
    .sort((a, b) => d3.ascending(+a, +b));

  // Escalas
  const escala_y = d3.scaleBand()
    .domain(tiposServicio)
    .rangeRound([0, altoGrafica])
    .paddingInner(0.25);

  const escala_y1 = d3.scaleBand()
    .domain(nivelesSatisfaccion)
    .rangeRound([0, escala_y.bandwidth()])
    .padding(0.08);

  const maxVal = d3.max(registros, d => d.cantidad) || 10;
  const escala_x = d3.scaleLinear()
    .domain([0, maxVal * 1.1])
    .nice()
    .rangeRound([0, anchoGrafica]);

  const colorScale = d3.scaleOrdinal()
    .domain(nivelesSatisfaccion)
    .range(d3.schemeTableau10);

  // Tooltip
  let tooltip = d3.select(".d3-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(15, 23, 42, 0.95)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");
  }

  // Cuadrícula de fondo
  const cuadricula = svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${altoGrafica})`)
    .call(d3.axisBottom(escala_x)
      .ticks(6)
      .tickSize(-altoGrafica)
      .tickFormat("")
    );

  cuadricula
    .selectAll(".tick")
    .filter((_dato, indice, marcas) => indice === marcas.length - 1)
    .select("line")
    .remove();

  cuadricula.selectAll("line")
    .style("stroke", "#e2e8f0")
    .style("stroke-dasharray", "3,3");

  // Eje Y (Servicios)
  const ejeY = svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(escala_y));

  ejeY.select(".domain").attr("stroke", "#6b7280");
  ejeY.selectAll(".tick line").attr("stroke", "#6b7280");
  ejeY.selectAll(".tick text")
    .attr("fill", "#4b5563")
    .style("font-size", "12px");

  // Eje X (Cantidad)
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${altoGrafica})`)
    .call(d3.axisBottom(escala_x).ticks(6))
    .call((eje) => eje.select(".domain").attr("stroke", "#6b7280"))
    .call((eje) => eje.selectAll(".tick line").attr("stroke", "#6b7280"))
    .call((eje) => eje.selectAll(".tick text").attr("fill", "#4b5563").style("font-size", "12px"))
    .append("text")
      .attr("x", anchoGrafica / 2)
      .attr("y", 38)
      .attr("fill", "#1e293b")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Cantidad de visitantes");

  // Título principal
  svg.append("text")
    .attr("x", 20 - margen.izquierda)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Nivel de Satisfacción por Instalación Turística");

  // Dibujar barras agrupadas
  const grupos = svg.append("g")
    .selectAll("g")
    .data(tiposServicio)
    .enter()
    .append("g")
    .attr("transform", d => `translate(0, ${escala_y(d)})`);

  const rects = grupos.selectAll("rect")
    .data(servicio => registros.filter(d => d.tipo_servicio === servicio))
    .enter()
    .append("rect")
    .attr("y", d => escala_y1(d.nivel_satisfaccion))
    .attr("height", escala_y1.bandwidth())
    .attr("x", 0)
    .attr("width", 0)
    .attr("fill", d => colorScale(d.nivel_satisfaccion))
    .attr("rx", 2);

  // Eventos Tooltip
  rects
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 0.8);
      tooltip.style("visibility", "visible")
        .html(`
          <div style="font-weight:bold;">${d.tipo_servicio}</div>
          <div>Nivel de satisfacción: <strong>${d.nivel_satisfaccion}</strong></div>
          <div>Cantidad: <strong>${d.cantidad} personas</strong></div>
        `);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 1.0);
      tooltip.style("visibility", "hidden");
    });

  // Animación horizontal
  rects.transition()
    .duration(700)
    .delay((d, i) => i * 20)
    .attr("width", d => escala_x(d.cantidad));

  // Leyenda lateral
  const leyenda = svg.append("g")
    .attr("transform", `translate(${anchoGrafica + 15}, 0)`);

  leyenda.append("text")
    .attr("x", 0)
    .attr("y", -5)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#334155")
    .text("Nivel satisfacción:");

  nivelesSatisfaccion.forEach((nivel, idx) => {
    const fila = leyenda.append("g")
      .attr("transform", `translate(0, ${idx * 18})`);

    fila.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", colorScale(nivel));

    fila.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .style("font-size", "12px")
      .style("fill", "#475569")
      .text(`Puntuación ${nivel}`);
  });
}

//FUNCIÓN INTEGRADA DE LLAMADA
function prepararygrafica4(jsoncrudo, sexo) {
  const datosAgrupados = prepararDatosParaGrafica(jsoncrudo, sexo);
  grafica4(datosAgrupados, sexo);
  
}