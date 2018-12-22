function bufferFunction(){
        // Gets the selected layer
        let e = document.getElementById("selectBufferLayer");
        let strLayer = e.options[e.selectedIndex].value;
        let numberInput = document.getElementById("bufferLength").value;

        if (!(numberInput === "" || numberInput == null)) {
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


    // Function for filtering out certain parts of a layer
    function filterFunction() {
        // Get index of selected layer
        let selectedLayer = document.getElementById("selectLayer");
        let indexOfLayer = selectedLayer.options[selectedLayer.selectedIndex].value;
        // Gets index of selected property type
        let selectedProperty = document.getElementById("selectProperty");
        let indexOfProperty = selectedProperty.options[selectedProperty.selectedIndex].value;

        let selectedOp = document.getElementById("selectOperator");
        let indexOfOperator = selectedOp.options[selectedOp.selectedIndex].value;

        let selectedVal = document.getElementById("selectValue");
        let indexOfValue = selectedVal.options[selectedVal.selectedIndex].value;

        // Gets the actual layer and property string
        let layer = geoArray[indexOfLayer]; // geoJSON object
        let property = properties[indexOfProperty]; // String for name of property
        let value = values[indexOfValue]; // Actual value, be it a number or string
        let op; // Initializing the operator string, selected beneath
        if (isAllValuesNumbers) { // If all values that can be chosen are numbers
            op = legalNumericOperators[indexOfOperator];
        } else { // otherwise we choose from string operators
            op = legalStringOperators[indexOfOperator];
        }


        let desiredFeatures = [];
        // Finds features in a layer with the desired property type and value(s)
        if (layer.type === "FeatureCollection") { //If FeatureCollection, loops through all features
            console.log("FeatureCollection selected");
            for (let f in layer.features) {
                let featureProperties = Object.keys(layer.features[f].properties);
                //Check each Feature if property exists. If yes, checks if it fulfills the operation.
                //If fulfilled, the Feature is collected for the creation of a new FeatureCollection.
                if (featureProperties.includes(property)) {
                    console.log("isAllValuesNumbers: " + isAllValuesNumbers);
                    if (isAllValuesNumbers) { // for numeric values
                        switch (op) {
                            // If desired value is found, extract the feature that contains it
                            case "=":
                                if (layer.features[f].properties[property] === value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            case ">":
                                if (layer.features[f].properties[property] > value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            case ">=":
                                if (layer.features[f].properties[property] >= value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            case "<":
                                if (layer.features[f].properties[property] < value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            case "<=":
                                if (layer.features[f].properties[property] <= value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;

                            default:
                                console.log('No matching operator');
                        }
                    } else { // for string values
                        console.log("Checking string operators...")
                        switch (op) {
                            case "=":
                                if (layer.features[f].properties[property] === value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            case "!=":
                                if (layer.features[f].properties[property] !== value) {
                                    desiredFeatures[desiredFeatures.length] = layer.features[f];
                                }
                                break;
                            default:
                                console.log('No matching operator');
                        }
                    }
                }
            }
        } else if (layer.type === "Feature") { //If single Feature, check the Feature
            console.log("Single feature selected");
            let props = Object.keys(layer.properties);
            if (props.includes(property)) {
                console.log("isAllValuesNumbers: " + isAllValuesNumbers);
                if (isAllValuesNumbers) { // for numeric values
                    switch (op) {
                        // If desired value is found, extract the feature that contains it
                        case "=":
                            if (layer.properties[property] === value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;
                        case ">":
                            if (layer.properties[property] > value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;
                        case ">=":
                            if (layer.properties[property] >= value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;
                        case "<":
                            if (layer.properties[property] < value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;
                        case "<=":
                            if (layer.properties[property] <= value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;

                        default:
                            console.log('No matching operator');
                    }
                    console.log("finished numeric check " + f);
                } else { // for string values
                    console.log("Checking string operators...")
                    switch (op) {
                        case "=":
                            if (layer.properties[property] === value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;
                        case "!=":
                            if (layer.properties[property] !== value) {
                                desiredFeatures[desiredFeatures.length] = layer;
                            }
                            break;


                        default:
                            console.log('No matching operator');
                    }
                }
            }
        }
        if (desiredFeatures.length === 0) {
            console.log("No feature found");
            alert("No features containg such value(s) was found")
        } else {
            console.log("Nr. of desired features: " + desiredFeatures.length);


            // Create new FeatureCollection containing desired features
            let newFC = turf.featureCollection(desiredFeatures);
            geoArray[geoArray.length] = newFC; // Adds to list of geoJSON objects
            // Create string for the name of layer
            let newFCString = "" + selectedLayer.options[selectedLayer.selectedIndex].text + "_" + property + op + value;
            // Create the layer for the FC
            let newFCLayer = L.geoJSON(newFC, {
                onEachFeature: function (feature, layer) {
                    let popup = makePopupContentForFeature(feature, newFCString);
                    layer.bindPopup(popup);
                }
            }).addTo(mymap);
            layerArray[layerArray.length] = newFCLayer; //Adds to list of leaflet layers

            layerControl.addOverlay(newFCLayer, newFCString); //Adds to the overlay control
            overlays[newFCString] = newFCLayer; //Adds to list(actually javascript object) of overlays added to the control

            selectLayer.options[selectLayer.options.length] = new Option(newFCString, selectLayer.options.length);

        }
    } // End of filterFunction



    // Function for creating a union between 2 layers (must be polygons)
    function unionFunction(){
            // Gets the selected layers
            let eA = document.getElementById("selectLayerA");
            let indexLayerA = eA.options[eA.selectedIndex].value;
            let eB = document.getElementById("selectLayerB");
            let indexLayerB = eB.options[eB.selectedIndex].value;

            if (!(indexLayerB===indexLayerA) && geoArray[indexLayerA].geometry.type==="Polygon" && geoArray[indexLayerB].geometry.type==="Polygon"){
                let newUnion = turf.union(geoArray[indexLayerA], geoArray[indexLayerB]);
                geoArray[geoArray.length] = newUnion;

                overlaysArray = Object.getOwnPropertyNames(overlays); // Update names of overlays
                let newUnionString = ""+overlaysArray[indexLayerA]+"_"+overlaysArray[indexLayerB]+"_union";

                let newUnionLayer = L.geoJSON(newUnion).bindPopup("Layer: "+newUnionString).addTo(mymap);
                layerArray[layerArray.length] = newUnionLayer;

                layerControl.addOverlay(newUnionLayer, newUnionString);

                overlays[newUnionString] = newUnionLayer;

                // Updates lists
                let newValue = selectLayerA.options.length;
                selectLayerA.options[selectLayerA.options.length] = new Option(newUnionString, newValue);
                selectLayerB.options[selectLayerB.options.length] = new Option(newUnionString, newValue);
            }

    } // End, unionFunction


    // Function for intersection between 2 layer (2 polygons)
    function intersectFunction(){
        // Gets the selected layers
        var eA = document.getElementById("selectLayerA");
        var indexLayerA = eA.options[eA.selectedIndex].value;
        var eB = document.getElementById("selectLayerB");
        var indexLayerB = eB.options[eB.selectedIndex].value;

        if (!(indexLayerB===indexLayerA) && geoArray[indexLayerA].geometry.type==="Polygon" && geoArray[indexLayerB].geometry.type==="Polygon"){
            var newIntersect = turf.intersect(geoArray[indexLayerA], geoArray[indexLayerB]);
            geoArray[geoArray.length] = newIntersect;

            overlaysArray = Object.getOwnPropertyNames(overlays); // Update names of overlays
            var newIntersectString = ""+overlaysArray[indexLayerA]+"_"+overlaysArray[indexLayerB]+"_intersect";

            var newIntersectLayer = L.geoJSON(newIntersect).bindPopup("Layer: "+newIntersectString).addTo(mymap);
            layerArray[layerArray.length] = newIntersectLayer;

            layerControl.addOverlay(newIntersectLayer, newIntersectString);

            overlays[newIntersectString] = newIntersectLayer;

            // Updates lists
            var newValue = selectLayerA.options.length;
            selectLayerA.options[selectLayerA.options.length] = new Option(newIntersectString, newValue);
            selectLayerB.options[selectLayerB.options.length] = new Option(newIntersectString, newValue);
        }
    } // End, intersectFunction



    // Function for difference between 2 layers (polygon or multipolygon)
    function differenceFunction(){
        // Gets the selected layers
        let eA = document.getElementById("selectLayerA");
        let indexLayerA = eA.options[eA.selectedIndex].value;
        let eB = document.getElementById("selectLayerB");
        let indexLayerB = eB.options[eB.selectedIndex].value;

        if (!(indexLayerB==indexLayerA) && geoArray[indexLayerA].geometry.type=="Polygon" && geoArray[indexLayerB].geometry.type=="Polygon"){
            let newDiff = turf.difference(geoArray[indexLayerA], geoArray[indexLayerB]);
            geoArray[geoArray.length] = newDiff;

            overlaysArray = Object.getOwnPropertyNames(overlays); // Update names of overlays
            let newDiffString = ""+overlaysArray[indexLayerA]+"_"+overlaysArray[indexLayerB]+"_difference";

            let newDiffLayer = L.geoJSON(newDiff).bindPopup("Layer: "+newDiffString).addTo(mymap);
            layerArray[layerArray.length] = newDiffLayer;

            layerControl.addOverlay(newDiffLayer, newDiffString);

            overlays[newDiffString] = newDiffLayer;

            // Updates lists
            let newValue = selectLayerA.options.length;
            selectLayerA.options[selectLayerA.options.length] = new Option(newDiffString, newValue);
            selectLayerB.options[selectLayerB.options.length] = new Option(newDiffString, newValue);
        }
    } // End, differenceFunction