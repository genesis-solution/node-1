import{w as e}from"./index-7VV-N64s.js";import{u as r}from"./ChangeView-CDkdWtqO.js";const a=({onChange:o,onZoom:t})=>(r({click(l){o(l.latlng),console.log(l.latlng)},zoom(l){console.log(l.target._zoom),t==null||t.call(l.target._zoom)}}),null);a.propTypes={onChange:e.func.isRequired,onZoom:e.func};export{a as M};