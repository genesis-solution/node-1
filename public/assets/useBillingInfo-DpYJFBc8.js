import{t as i,bT as o,a7 as r,k as a}from"./index-7VV-N64s.js";const m={nameOnAccount:"",bankAccountNumber:"",confirmBankAccountNumber:"",bankName:"",address:{salutation:"",email:"",phone:"",firstName:"",lastName:"",address:"",country:"United States",city:"",state:"Connecticut",zip:""}};function d(){const{data:e,isLoading:s}=i({queryKey:["bankAccount"],queryFn:async({signal:t})=>{const n=await a.get("/bankAccount",{signal:t});return n.data.confirmBankAccountNumber=n.data.bankAccountNumber,n.data},initialData:m}),u=o(),{mutate:c}=r({mutationFn:async t=>(await a.patch("/bankAccount",t)).data,onSuccess:()=>{u.invalidateQueries({queryKey:["bankAccount"]})}});return{data:e,isLoading:s,updateBillingInfo:c}}export{d as u};
