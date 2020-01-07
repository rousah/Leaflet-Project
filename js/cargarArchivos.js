async function cargaTiff(url, nombre) {
    // Buscamos la url
    const response = await fetch(url);

    // Cogemos el arraybuffer
    const arrayBuffer = await response.arrayBuffer();

    // Creamos el scalarfield del arraybuffer
    var s = L.ScalarField.fromGeoTIFF(arrayBuffer);
    var options = {}
    switch (nombre) {
        case "Incendio":
        case "Temperaturas":
            options = {
                // yellow red
                color: chroma.scale(['#FFD500', '#DB1003']).mode('rgb').domain(s.range)
            }
            break;
        case "Lluvia":
            options = {
                // blue
                color: chroma.scale(['#89E9FF', '#0001FF']).mode('rgb').domain(s.range)
            }
            break;
        case "dNBR septiembre 2018":
            options = {
                // blue
                color: chroma.scale(['#89E9FF', '#0001FF']).mode('rgb').domain(s.range)
            }
            break;
    }
    // Creamos la capa
    var layer = L.canvasLayer.scalarField(s, options)

    // Asignamos la capa a su grupo correspondiente
    overlayMaps[nombre.toString()] = layer;

    // ON CLICK de un pixel del GeoTIFF
    layer.on('click', function (e) {
        if (e.value !== null) {
            // Cogemos el valor
            let html;
            let vector = e.value;
            var lat = e.latlng.lat;
            var long = e.latlng.lng;
            // Creamos el html
            switch (nombre) {
                case "Temperaturas":
                    html = (`<span><b>Grados: </b>${vector.toFixed(2)}ºC<br><b>Posición:</b> ${lat.toFixed(4)}, ${long.toFixed(4)}</span>`);
                    break;
                case "Incendio":
                    html = (`<span><b>Severidad: </b>${vector.toFixed(2)}<br><b>Posición:</b> ${lat.toFixed(4)}, ${long.toFixed(4)}</span>`);
                    break;
                case "Lluvia":
                    html = (`<span><b>Nivel de lluvia: </b>${vector.toFixed(2)}<br><b>Posición:</b> ${lat.toFixed(4)}, ${long.toFixed(4)}</span>`);
                    break;
                case "dNBR septiembre 2018":
                    html = (`<span><b>dNBR: </b>${vector.toFixed(2)}<br><b>Posición:</b> ${lat.toFixed(4)}, ${long.toFixed(4)}</span>`);
                    break;
            }
            // Creamos un popup
            let popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(html)
                .openOn(map);
        }
    });
}


async function cargaShapefileZip(url, nombre) {
    options = {
        style: function (feature) {
            if (nombre == "idk") {
                console.log(feature.properties)
            }
            // Para el corine incendio tipos de vegetacion
            if (feature.properties.DESC_ != null) {
                // Min 0 max 1623
                return {
                    fillColor: getColorVegetacion(feature.properties.AREA_HA),
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.8
                };
            }
            // Para la aptitud de repoblación
            else if (feature.properties.Aptitud != null) {
                return {
                    fillColor: getColorAptitud(feature.properties.Aptitud),
                    weight: 1, // Grosor del borde
                    opacity: 0.5,
                    color: 'green',
                    fillOpacity: 1
                };
            }
            else if (feature.properties.Cod_ccaa != null) {
                return {
                    fillColor: getRandomColor(feature.properties.Cod_prov),
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            else if (feature.properties.Area != null) {
                return {
                    fillColor: getRandomColor(feature.properties.Area),
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            else if (feature.properties.CONTOUR != null) {
                return {
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    weight: 3,
                    color: getRandomColor(feature.properties.CONTOUR),
                    fillOpacity: 1
                };
            }
        }
    }
    var layer = L.shapefile(url, options)
    overlayMaps[nombre.toString()] = layer;

    // ON CLICK de un pixel del Shapefield
    layer.on('click', function (e) {
        if (e.value !== null) {
            let html;

            // Para el corine incendio tipos de vegetacion
            if (e.layer.feature.properties.DESC_ != null) {
                // Cogemos el valor
                let tipo = e.layer.feature.properties.DESC_;
                let area = e.layer.feature.properties.AREA_HA;
                // Creamos el html
                html = ('<h6>Tipo de vegetación:</h6>' + tipo + '<br/> <h6>Área:</h6> ' + area.toFixed(2) + 'ha')
            }

            // Para repoblación del ayora
            if (e.layer.feature.properties.Aptitud != null) {
                // Cogemos el valor
                let aptitud = e.layer.feature.properties.Aptitud;
                let area = e.layer.feature.properties.Area;
                // Creamos el html
                html = ('<h6>Aptitud:</h6>' + aptitud + '<br/> <h6>Área:</h6> ' + area + 'ha')
            }

            // Para puntos de lluvia
            if (e.layer.feature.properties.Cod_ccaa != null) {
                // Cogemos el valor
                let nombre = e.layer.feature.properties.Nombre;
                // Creamos el html
                html = ('<h6>Nombre:</h6>' + nombre)
            }

            // Para com
            if (e.layer.feature.properties.Area != null) {
                // Cogemos el valor
                let area = e.layer.feature.properties.Area;
                let perimetro = e.layer.feature.properties.Perimetro;
                // Creamos el html
                html = ('<h6>Área:</h6>' + area + '<br><h6>Perímetro:</h6>' + perimetro)
            }

            // Para contornos
            if (e.layer.feature.properties.CONTOUR != null) {
                // Cogemos el valor
                let contour = e.layer.feature.properties.CONTOUR;
                // Creamos el html
                html = ('<h6>Contorno:</h6>' + contour)
            }

            // Para ptos lluvia
            if (e.layer.feature.properties.JUN != null) {
                // Cogemos el valor
                let contour = e.layer.feature.properties.JUN;
                // Creamos el html
                html = ('<h6>Valor:</h6>' + contour)
            }

            // Creamos un popup
            let popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(html)
                .openOn(map);
        }
    });
}

/*   async function cargaShapefile(geojson, nombre) {
       var layer = L.geoJSON(geojson)
       overlayMaps[nombre.toString()] = layer;
   }*/


function getColorVegetacion(area) {
    return area > 400 ? '#253494' :
        area > 300 ? '#2c7fb8' :
            area > 200 ? '#41b6c4' :
                area > 100 ? '#a1dab4' :
                    '#ffffcc';
}

function getColorAptitud(aptitud) {
    switch (aptitud) {
        case 13: return '#e5f5e0'
        case 14: return '#a1d99b'
        case 15: return '#31a354'
    }
}

function getRandomColor(valor) {
    return chroma.random();
}
