import{I as o,l as a}from"./index-7VV-N64s.js";import{d as i,C as m}from"./react-big-calendar.esm-BZcNkvgM.js";import{u as c}from"./useBooking-BmA3KNKF.js";const l=i(o);function h({params:r}){const{data:s}=c(r),n=s.map(t=>({title:`BK${t.id} - ${t.products.map(d=>{var e;return(e=d.product)==null?void 0:e.name}).join(", ")}`,start:new Date(t.rent.start),end:new Date(t.rent.end)}));return a("div",{style:{height:"70vh"},children:a(m,{localizer:l,events:n})})}export{h as C};
