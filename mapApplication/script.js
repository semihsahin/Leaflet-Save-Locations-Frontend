/* eslint-disable no-undef */
/**
 * Sidebar data
 */

// config map
let config = {
  minZoom: 7,
  maxZoom: 18,
};
// magnification with which the map will start
const zoom = 18;
// co-ordinates
const lat = 0;
const lng = 0;

const getUrl = "http://localhost:8080/get-all"


// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);



map
  .locate({
    // https://leafletjs.com/reference-1.7.1.html#locate-options-option
    setView: true,
    enableHighAccuracy: true,
  })
  .on("locationfound", (e) => {
    // marker
    const marker = L.marker([e.latitude, e.longitude]).bindPopup(
      "Your are here :)"
    );
  })
  // if error show alert
  .on("locationerror", (e) => {
    alert("Location access denied.");
  });



const sidebar = document.getElementById("sidebar");



class Coordinates{
  constructor(latitude, longitude,) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
let listCoordinates=[];


async function getDateLocation() {
  let url = 'users.json';
  try {
    let res = await fetch(getUrl);
    return await res.json();
  } catch (error) {
  }
}

async function render(){
  let dateLocation = await getDateLocation();
  dateLocation.forEach(dl =>{
    listCoordinates.push(new Coordinates(dl.latitude,dl.longitude));
  })
}

//same page
for (let i = 0; i < listCoordinates.length; i++) {
  const lat = listCoordinates[i].latitude;
  const lng = listCoordinates[i].longitude;
  marker = new L.marker([lat, lng]).addTo(map);
  createSidebarElements(marker);
}



function createSidebarElements(layer) {
  const el = `<div class="sidebar-el" data-marker="${layer._leaflet_id}">${layer
    .getLatLng()
    .toString()}</div>`;

  const temp = document.createElement("div");
  temp.innerHTML = el.trim();
  const htmlEl = temp.firstChild;

  L.DomEvent.on(htmlEl, "dblclick", zoomToMarker);
  L.DomEvent.on(htmlEl, "click", deleteCoordinate);



  sidebar.insertAdjacentElement("beforeend", htmlEl);
}

function zoomToMarker(e) {
  const clickedEl = e.target;
  const markerId = clickedEl.getAttribute("data-marker");
  const marker = fg.getLayer(markerId);
  const getLatLong = marker.getLatLng();
  marker.addTo(map);

  console.log("added");


  marker.bindPopup(getLatLong.toString()).openPopup();
  map.panTo(getLatLong);
}

function deleteCoordinate(e) {
  const clickedEl = e.target;
  const markerId = clickedEl.getAttribute("data-marker");
  const marker = fg.getLayer(markerId);
  document.addEventListener("keypress", event => {
    if (event.key == 'd'){
      clickedEl.remove();
      marker.remove();
    }
  })
}

const fg = L.featureGroup().addTo(map);


const markerPlace = document.querySelector(".center-of-map-description");

/*function updateInfo() {
  const { lat, lng } = map.getCenter();
  const zoom = map.getZoom();
  markerPlace.innerHTML = `center: ${lat.toFixed(5)}, ${lng.toFixed(
    5
  )} | zoom: ${zoom}`;
} */



function sendData(jsonData){
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/insert",
    data: jsonData,
    async: true,
    contentType: "application/json",
    crossDomain: true,
    headers: {
            'Access-Control-Allow-Origin': '*',
          },
    success: function () {

    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      alert("Status: " + textStatus); alert("Error: " + errorThrown);
    }

  });
}

function downloadURI(uri, name)
{
  var link = document.createElement("a");
  // If you don't know the name or want to use
  // the webserver default set name = ''
  link.setAttribute('download', name);
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  link.remove();
}


const downloadButton = L.Control.extend({
  // button position
  options: {
    position: "bottomright"
  },

  // method
  onAdd: function (map) {
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "Download all marks";
    btn.textContent = "Download";
    btn.className = "DownloadButton";
    btn.setAttribute(
      "style",
      "background-color: white; width: 100px; height: 22px; border: left; display: flex; cursor: pointer; justify-content: center; font-size: 1rem;"
    );

    // actions on mouseover
    btn.onmouseover = function () {
      this.style.transform = "scale(1.1)";
    };

    // actions on mouseout
    btn.onmouseout = function () {
      this.style.transform = "scale(1)";
    };

    //download file
    btn.onclick = function (){
      fetch(getUrl)
        .then(resp => resp.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // the filename you want
          a.download = 'records';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          alert('your file has been downloaded!');
        })
        .catch(() => alert('oh no!'));

    };

    return btn;
  },
});
map.addControl(new downloadButton());

 //update info about bounds when site loaded
/*document.addEventListener("DOMContentLoaded", function () {
  updateInfo();
});*/


const addButton = L.Control.extend({
  // button position
  options: {
    position: "topright",
  },

  // method
  onAdd: function (map) {
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "Save location";
    btn.textContent = "Save";
    btn.className = "Save";
    btn.setAttribute(
      "style",
      "background-color: white; width: 60px; height: 25px; border: left; display: flex; cursor: pointer; justify-content: center; font-size: 1rem;"
    );

    // actions on mouseover
    btn.onmouseover = function () {
      this.style.transform = "scale(1.1)";
    };

    // actions on mouseout
    btn.onmouseout = function () {
      this.style.transform = "scale(1)";
    };

    btn.onclick = function (){

      const marker = L.marker(map.getCenter()).addTo(fg);
      marker.remove();
      createSidebarElements(marker);
      jsonData = JSON.stringify({latitude: map.getCenter().lat, longitude: map.getCenter().lng,
        dateTime: new Date().toLocaleString()})
      sendData(jsonData);
    };

    return btn;
  },
});
map.addControl(new addButton());

