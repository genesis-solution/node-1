import{w as e}from"./index-CYYMkemY.js";import{u as r}from"./ChangeView-C20L4T_u.js";const a=({onChange:o,onZoom:t})=>(r({click(l){o(l.latlng),console.log(l.latlng)},zoom(l){console.log(l.target._zoom),t==null||t.call(l.target._zoom)}}),null);a.propTypes={onChange:e.func.isRequired,onZoom:e.func};export{a as M};