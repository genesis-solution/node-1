import{r as e,t as d,k as n,a7 as l}from"./index-CYYMkemY.js";import{S as i}from"./Spot-BQhcZjWC.js";function S(){const[u,o]=e.useState(),a=e.useRef(),{isLoading:p}=d({queryKey:["spots"],queryFn:async({signal:t})=>{var r;const s=((r=(await n.get("/product",{params:{draft:!0},signal:t})).data.products)==null?void 0:r[0])??{availability:i.availability};return o(s),a.current=s,s},initialData:{availability:i.availability}}),{mutateAsync:c}=l({mutationFn:async(t={draft:!0})=>(await n.patchForm("/product",t)).data,onSuccess:t=>{a.current=t}});return{spot:u,setSpot:o,isLoading:p,updateSpot:c,spotRef:a}}export{S as u};
