import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-75.696);
  const [lat] = useState(45.3876);
  const [zoom] = useState(14);


  //INSTALL GEOCODER FROM HERE:
  //https://github.com/maplibre/maplibre-gl-geocoder

  //GEOCODER from MAPLIBRE SITE

  const Geo = {
    forwardGeocode: async (config) => {
      const features = [];
      try {
        let request =
          "https://nominatim.openstreetmap.org/search?q=" +
          config.query +
          "&format=geojson&polygon_geojson=1&addressdetails=1";
        const response = await fetch(request);
        const geojson = await response.json();
        for (let feature of geojson.features) {
          let center = [
            feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
          ];
          let point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: center,
            },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ["place"],
            center: center,
          };
          features.push(point);
        }
      } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
      }

      return {
        features: features,
      };
    },
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      //   style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      //   style: 'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            // tiles: ["https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"],
            // tiles: ['https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
          terrainSource: {
            type: "raster-dem",
            url: "terrain/terrain.json",
            // url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
            tileSize: 256,
          },
          hillshadeSource: {
            type: "raster-dem",
            url: "terrain/hillshade.json",
            // url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
          {
            id: "hills",
            type: "hillshade",
            source: "hillshadeSource",
            layout: { visibility: "visible" },
            paint: { "hillshade-shadow-color": "#473B24" },
          },
        ],
        terrain: {
          source: "terrainSource",
          exaggeration: 0.08,
        },
      },

      center: [lng, lat],
      zoom: zoom,
    });

    //ADD CONTROLS
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.addControl(
      new maplibregl.TerrainControl({
        source: "terrainSource",
        exaggeration: 0.08,
      })
    );

    // ADD THE GEOCODER
    var geocoder = new MaplibreGeocoder(Geo, {
      maplibregl: maplibregl,
    });
    map.current.addControl(geocoder);
  });

  // map.current.addControl(
  // new MaplibreGeocoder(geocoder_api, {
  // maplibregl: maplibregl
  // })
  // );

  //ADD A MARKER
  // new maplibregl.Marker({color: "#FF0000"})
  // .setLngLat([139.7525,35.6846])
  // .addTo(map.current);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
