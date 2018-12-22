function bufferFunction(){
        // Gets the selected layer
        let e = document.getElementById("selectBufferLayer");
        let strLayer = e.options[e.selectedIndex].value;
        let numberInput = document.getElementById("bufferLength").value;

        if (!(numberInput == "" || numberInput == null)) {
            let newBuffer = turf.buffer(overlays[strLayer].toGeoJSON(), (numberInput*1.1479353798440702759084213925493208038064486526513132205531901412468107864020422411741033562379781929643901679238), {units: 'kilometers', steps: 1024});
            let newBufferString = "" + strLayer +"_Buffer_"+numberInput+"km";

            if (newBuffer.type === "Feature") {
                //Update(or set) value of area
                newBuffer.properties["area (km^2)"] = turf.area(newBuffer)/1000000;
                let newBufferLayer = L.geoJSON(newBuffer).bindPopup(makePopupContentForFeature(newBuffer, newBufferString)).addTo(mymap);
                layerControl.addOverlay(newBufferLayer, newBufferString);

                overlays[newBufferString] = newBufferLayer;
                selectLayer.options[selectLayer.options.length] = new Option(newBufferString, newBufferString);

            } else if (newBuffer.type === "FeatureCollection") {
                //alert(newBufferLayer.features.length);
                //let numberOfFeateres = newBufferLayer.features.length
                let newBufferLayer = L.geoJSON(newBuffer, {
                    onEachFeature: function (feature, layer) {
                        // Set area
                        feature.properties["area (km^2)"] = turf.area(feature)/1000000;

                        // Bind popup with values of properties
                        content = makePopupContentForFeature(feature, newBufferString);
                        layer.bindPopup(content);
                    }
                }).addTo(mymap);
                layerControl.addOverlay(newBufferLayer, newBufferString);

                // Updates layer list
                overlays[newBufferString] = newBufferLayer;
                // Look to replace this part with function
                selectLayer.options[selectLayer.options.length] = new Option(newBufferString, newBufferString);
            }

        } else {
            alert("No value for radius length selected")
        }
    }

    // Makes a table of all properties for a feature, used for popup text/content to make it easier to see what is what
    // and what properties each layer/feature has
    function makePopupContentForFeature(feature, layerStr) {
            let popupContent = '<table>';
            popupContent += '<tr><td>' + "Layer name" + ':</td><td>'+ layerStr + '</td></tr>'
            for (var p in feature.properties) {
                popupContent += '<tr><td>' + p + ':</td><td>'+ feature.properties[p] + '</td></tr>';
            }
            popupContent += '</table>';
            return popupContent;
    }