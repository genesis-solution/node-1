import{bn as c,k as n}from"./index-7VV-N64s.js";function r(){return c({queryKey:["cancellations"],queryFn:async(a,e)=>{const{data:t}=await n.get("/cancelation",{signal:e,params:a});return t}})}async function l(a){console.log("Deleting cancelation",a);try{await n.delete(`/cancelation/${a}`)}catch{}}export{l as d,r as u};