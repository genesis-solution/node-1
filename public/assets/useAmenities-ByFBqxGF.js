import{t as n,k as r}from"./index-7VV-N64s.js";function m(){const{isLoading:e,isError:s,data:t,refetch:a}=n({queryKey:["amenities"],queryFn:async({signal:i})=>(await r.get("/amenities",{signal:i})).data,initialData:[]});return{amenities:t,isLoading:e,isError:s,refetch:a}}export{m as u};
