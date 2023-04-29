Promise.all([d3.json ("https://raw.githubusercontent.com/ivangp21/herramientas/main/comunidades_que_han_perdido_o_ganado_poblacion_respecto_al_semestre_anterior.json"), d3.json ("https://raw.githubusercontent.com/ivangp21/herramientas/main/comunidadprovincia.json")]).then (function ([datos, datosprovincias]){
    // Verificación de Carga
    // -----------------------------------------------------
    console.log("Ya he cargado correctamente los datos");

    // IMÁGEN PRINCIPAL (COMUNIDADES)
    // -----------------------------------------------------
    // Tamaño de la Imagen Principal
    var height = 400;
    var width = 600;
    
    // Márgenes de la imagen Principal
    var margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }
  
    // IMÁGEN SECUNDARIA (PROVINCIAS)
    // -----------------------------------------------------
    // Tamaño de la Imágen Secundaria
    const margin2 = { 
        top: 20, 
        right: 20, 
        bottom: 30, 
        left: 40 
    };
    
    // Márgenes de la Imágen secundaria
    const width2 = 400 - margin2.left - margin2.right;
    const height2 = 400 - margin2.top - margin2.bottom;
    
    // HOVER & TOOLTIP
    // -----------------------------------------------------
    const staticColor = '#437c90';
    const hoverColor = '#eec42d';
    
    const tooltip = d3
        .select('div#grafico2')
        .append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('padding', '10px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '4px')
        .style('color', '#fff')
        .text('a simple tooltip');

    // ESCALAS
    //---------------------------------------------------------
    // Escala Horizontal (X): Ubica dentro del Mapa de España
    // Usando la coordenada X del dataset, va a posicionar el círculo en el punto del mapa correspondiente a la Comunidad
    var escalaX = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.X))
        .range([0 + margin.right, height - margin.left,]);

    // Escala Vertical (Y): Ubica dentro del Mapa de España
    // Usando la coordenada Y del dataset, va a posicionar el círculo en el punto del mapa correspondiente a la Comunidad
    var escalaY = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.Y))
        .range([0 + margin.bottom, height - margin.top]);

    // Escala de Color
    // Se toma el rango de valores posibles de pérdida o ganancia y se mapea a Rojo (pérdida) y Verde (ganancia).
    // TODO: 1. Blanco depende del fondo / 2. ajustar el rango de forma dinámica?
    var escalaColor = d3.scaleLinear()
        .domain([-2000, 0, 35000])
        .range(["red", "white", "green"])
        .interpolate(d3.interpolateRgb);

    // Escala de tamaño
    // Se ajusta el tamaño del círculo representado en función del valor de variación
    var escalatamanio = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.Valor))
        .range([15, 60]);

    //---------------------------------------------------------
    //---------------------------------------------------------
    // IMÁGEN PRINCIPAL (COMUNIDADES)
    //---------------------------------------------------------
    //---------------------------------------------------------
    // Objeto de la Imagen de Comunidades
    var elementoSVG = d3.select("div#grafico1")
        .append("svg")                              // Añadimos una imágen SVG al DIV Del Gráfico 1 (Comunidades)
        .attr("width", width)                       // Ajustamos su tamaño
        .attr("height", height)
        .selectAll("circle")                        // En la que añadiremos círculos
        .data(datos)                                // Usando la información de Datos (Comúnidades con pérdida o ganancia de población)
        .enter()
        .append("circle")
        .attr("r", d => escalatamanio(d.Valor))     // Ajustamos el radio usando una escala de Tamaño en función del valor de ganancia/pérdida
        .attr("cx", d => escalaX(d.X))              // Ajustamos la posición usando una escala horizontal. Usa la coordenada X del dataset (posiciona en el mapa)
        .attr("cy", d => escalaY(d.Y))              // Ajustamos la posición usando una escala vertical. Usa la coordenada Y del dataset (posiciona en el mapa)
        .attr("fill", d => escalaColor(d.Valor))    // Ajustamos el color usando una escala de color. De Rojo (pérdida) a Verde (ganancia), pasando por blanco (sin cambio)
        .on("mouseover", function(d) {                                  // MouseOver  (Resaltará y Visualizará el nombre de la comunidad y el valor de ganancia/pérdida)
                                                                        // --------------------------------------------------
                d3.select(this)                                         // Tomamos el elemento sobre el que se pasa el ratón
                    .attr("fill", "yellow");                            // Lo resaltamos en amarillo
                var xPosition = parseFloat(d3.select(this).attr("cx")); // Recogemos la ubicación del elemento sobre el que se pasa el ratón
                var yPosition = parseFloat(d3.select(this).attr("cy"));

                d3.select("svg")                                        // Seleccionamos la Imagen
                    .append("text")                                     // Añadimos un nuevo texto
                    .attr("id", "tooltip")                              // Marcado como tooltip
                    .attr("x", xPosition)                               // Que se ubicará en la posición X
                    .attr("y", yPosition)                               // Y en la posición Y en vertical, ligeramente desplazado para facilitar la lectura
                    .attr("text-anchor", "middle")                      // Centramos el texto
                    .attr("font-family", "sans-serif")                  // Asignamos tipografíá Sans-Seriff
                    .attr("font-size", "11px")                          // Y tamaño 11
                    .attr("font-weight", "bold")                        // Negrita
                    .text(d.Parametro + ": " + d.Valor);                // Visualizamos el nombre de la Comunidad y el valor de ganancia/Pérdida
        })  
        .on("mouseout", function(d) {                                   // MouseOut  (Elimina los efectos del Mouseover: Restaura Color y Elimina Tooltip)
                                                                        // --------------------------------------------------
                d3.select(this)                                         // Seleccionamos el elemento del que se saca el ratón
                    .attr("fill", function(d) {                         // Se restaura el color del elemento previo al MouseOver
                        return escalaColor(d.Valor)                     // Para ello se obtiene el valor de la escala de color correspondiente al valor de Gan./Pér.
                });
                d3.select("#tooltip").remove();                         // Elimina el Tooltip
        })
        .on("click", d => pintarGrafica2(d.Parametro))                  // MouseClick  (Carga la Gráfica Secundaria - Provincias)
  
    
    //---------------------------------------------------------
    //---------------------------------------------------------
    // IMÁGEN SECUNDARIA (PROVINCIAS)
    //---------------------------------------------------------
    //---------------------------------------------------------
    // IMAGEN: Objeto de la Imagen de Provincias
    var svgProvincias=d3.select ("div#grafico2")
                .append("svg")                                                      // Añadimos una imágen SVG al DIV Del Gráfico 2 (Provincias)     
                .attr('width', width2 + margin2.left + margin2.right)               // Ajustamos los márgenes
                .attr('height', height2 + margin2.top + margin2.bottom)
    
    // EJE Y: Creamos el eje Y para utilizar posteriormente
    var gEjeY = svgProvincias
                .append("g")                                                        // Añadimos un elemento grupal
                .attr('class', 'y axis')                                            // Asignamos la clase Y Axis
                .attr("transform",`translate(${margin2.left}, 0)`)                  // Y lo ajustamos dejando  margen para que quepan los textos
    
    // EJE X: Creamos el eje X para utilizar posteriormente
    var gEjeX = svgProvincias
                .append('g')                                                        // Añadimos un elemento grupal
                .attr('class', 'x axis')                                            // Asignamos la clase X Axis
                .attr('transform', `translate(${margin2.left}, ${height2})`)        // Y lo ajustamos de acuerdo a los márgenes aplicados previamente y el margen vertical 
    
    // FUNCIÓN PARA LA CARGA DE LA IMAGEN DE PROVINCIAS
    // -----------------------------------------------------
    // Parámetro:
    //  * pfiltro: Indica la comunidad autónoma seleccionada con mouseclick en la imágen principal de comunidades
    // Descripción:
    //      Carga los datos específicos de cada provincia correspondiente a la comunidad seleccionada y los visualiza
    //          en formato gráfico de barras.
    //      Puesto que cada comunidad tiene un número distintos de provincias y un rango de valores distinto se deben
    //          cargar de cada vez unos nuevos ejes X e Y.
    function pintarGrafica2(pfiltro) {               
            // DATOS: Cargamos los datos correspondientes a las provincias asociadas a la comunidad seleccionada        
            var datosprovinciasfiltrado = datosprovincias.filter(x => x.Comunidad === pfiltro)                     
            
            // EJE Y
            //---------------------------------------------------------
            // Escala Y: Definimos una escala vertical para las provincias de esta comunidad
            var escalaYProvincia = d3.scaleLinear()                          
                .domain([0, d3.max(datosprovinciasfiltrado, d => d.Valor)])     // Establecemos el margen de valores de los datos de las provincias 
                .range([height2, 0]);                                           // Establecemos el rango de visualización entre el alto de la gráfica y 0
             
            // Eje Y: Definimos la visualización del Eje Y para esta comunidad
            var ejeYProvincia = d3.axisLeft (escalaYProvincia)                  // Aplicamos la escala Y definida antes en un Eje Vertical orientado a la izquierda
                .ticks (5)                                                      // Definimos el formato de los ticks del eje
                .tickFormat (d3.format(".3s"))    
             
            // EJE X
            //---------------------------------------------------------
            // Escala X: Definimos una escala horizontal para las provincias de esta comunidad usando bandas para el gráfico de barras
            var escalaXProvincia = d3.scaleBand()
                .domain(datosprovinciasfiltrado.map(d => d.Parametro))          // Establecemos qué valores van a conformar las barras del eje X  
                .range([0, width2])                                             // Establecemos el rango X que ocupará el gráfico de barras.
                .round(true)                                                    // Indicamos que se redondeará
                .paddingInner(0.1);                                             // Establecemos el padding entre barras     

            // Eje X: Definimos la visualización del Eje X para esta comunidad
            var ejeXProvincia = d3.axisBottom()                                 // Aplicamos la escala X definida antes en un Eje Horizontal orientado hacia abajo
                  .scale(escalaXProvincia);        
               
            // Pintado de EJES
            //---------------------------------------------------------
            // De cada vez deben pintarse los ejes nuevamente        
            gEjeX.call(ejeXProvincia)
            gEjeY.call(ejeYProvincia)
            
        
            // Pintado de BARRAS
            //---------------------------------------------------------
  
        
        
        
                /*svgProvincias.append('g')
              .attr('class', 'y axis')
              .attr('transform', `translate(${margin2.left}, ${margin2.right})`)
              .call(ejeYProvincia)*/
              //.append('text')
              //.attr('transform', 'rotate(-90)')
              //.attr('y', 6)
              //.attr('dy', '.71em')
             // .style('text-anchor', 'end')
              //.text('Provincia') 
           
        
            // Pintado de DATOS
            //---------------------------------------------------------
            svgProvincias
              .selectAll(".bar")                 
              .attr('fill', staticColor)
              .attr('x', d => escalaXProvincia(d.Parametro))
              .attr('width', escalaXProvincia.bandwidth())
              .attr('y', d => escalaYProvincia(d.Valor))
              .attr('height', d => height2 - escalaYProvincia(d.Valor))              
              .attr("transform",`translate(${margin2.left}, 0)`)
                 .on('mouseover', function (event, d) {
                      tooltip
                        .html(
                          `<div>Provincia: ${d.Parametro}</div><div>Población: ${d.Valor}</div>`
                        )
                        .style('visibility', 'visible');
                      d3.select(this).transition().attr('fill', hoverColor);
                  })
                  .on('mousemove', function (event) {
                      tooltip
                        .style('top', d3.pageY - 10 + 'px')
                        .style('left', d3.pageX + 10 + 'px');
                  })
                  .on('mouseout', function (event) {
                      tooltip.html(``).style('visibility', 'hidden');
                      d3.select(this).transition().attr('fill', staticColor);
                  }); 
           
   
            svgProvincias
                  .selectAll(".bar")
                  .remove()
                  .exit()
                  .data(datosprovinciasfiltrado)
                  .enter()
                  .append('rect')
                  .attr('class', 'bar')
                  .attr('fill', staticColor)
                  .attr('x', d => escalaXProvincia(d.Parametro))
                  .attr('width', escalaXProvincia.bandwidth())
                  .attr('y', d => escalaYProvincia(d.Valor))
                  .attr('height', d => height2 - escalaYProvincia(d.Valor))
                  .on('mouseover', x => {
                    tooltip
                      .html(
                        `<div>Provincia: ${x.Parametro}</div><div>Población: ${x.Valor}</div>`
                      )
                      .style('visibility', 'visible');
                    d3.select(this).transition().attr('fill', hoverColor);
                  })
                  .on('mousemove', function (event) {
                    tooltip
                      .style('top', d3.pageY - 10 + 'px')
                      .style('left', d3.pageX + 10 + 'px');
                  })
                  .on('mouseout', function (event) {
                    tooltip.html(``).style('visibility', 'hidden');
                    d3.select(this).transition().attr('fill', staticColor);
                  });   
                  
        }
}); 