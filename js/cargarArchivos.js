async function cargaTiff(url, nombre) {
    // Buscamos la url
    const response = await fetch(url);

    // Cogemos el arraybuffer
    const arrayBuffer = await response.arrayBuffer();

    // Creamos el scalarfield del arraybuffer
    var s = L.ScalarField.fromGeoTIFF(arrayBuffer);
    console.log(s)
    // Creamos la capa y la añadimos
    var layer = L.canvasLayer.scalarField(s, {
        // yellow red
        color: chroma.scale(['#FFD500', '#DB1003']).mode('rgb').domain(s.range)
    }).addTo(map);

    // Asignamos la capa a su grupo correspondiente
    overlayMaps[nombre.toString()] = layer;

    // ON CLICK de un pixel del GeoTIFF
    layer.on('click', function (e) {
        if (e.value !== null) {
            // Cogemos el valor
            let vector = e.value;
            var lat = e.latlng.lat;
            var long = e.latlng.lng;
            console.log(e)
            // Creamos el html
            let html = (`<span><b>Severidad: </b>${vector}<br><b>Posición:</b> ${lat.toFixed(4)}, ${long.toFixed(4)}</span>`);
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
            // Para el corine incendio tipos de vegetacion
            if (feature.properties.DESC_ != null) {
                // Min 0 max 1623
                return {
                    fillColor: getColorVegetacion(feature.properties.AREA_HA),
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
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
                    fillColor: getColorVegetacion(feature.properties.Cod_ccaa),
                    weight: 1, // Grosor del borde
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            else {
                console.log(feature)
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
                html = ('<h4>Tipo de vegetación:</h4>' + tipo + '<br/> <h4>Área:</h4> ' + area.toFixed(2) + 'ha')
            }

            // Para repoblación del ayora
            if (e.layer.feature.properties.Aptitud != null) {
                // Cogemos el valor
                let aptitud = e.layer.feature.properties.Aptitud;
                let area = e.layer.feature.properties.Area;
                // Creamos el html
                html = ('<h4>Aptitud:</h4>' + aptitud + '<br/> <h4>Área:</h4> ' + area + 'ha')
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
    return area > 1500 ? '#225ea8' :
        area > 700 ? '#41b6c4' :
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