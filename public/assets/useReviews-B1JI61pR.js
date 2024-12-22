import{t as s,k as t}from"./index-CYYMkemY.js";function i(e){return s({queryKey:["reviews",e],queryFn:async({signal:r})=>(await t.get("/review",{params:e,signal:r})).data.reviews})}export{i as u};
