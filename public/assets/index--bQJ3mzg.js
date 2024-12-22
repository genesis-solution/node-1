import{w as c,r as l,n as o,l as r,bo as g,F as D,I as h,bn as b,k as f,t as v,bC as y,aF as F,b1 as w}from"./index-7VV-N64s.js";import{C as N}from"./index-BvPaxc03.js";const q=[{id:"createdAt",header:"DateTime",accessorFn:t=>{const e=t.createdAt;return new Date(e).toLocaleString()}},{id:"order.id",header:"Booking ID",accessorFn:t=>{var e;return(e=t.order)==null?void 0:e.id}},{id:"Spot ID",header:"Spot ID",accessorFn:t=>{var e;return(e=t.order.products[0].product)==null?void 0:e.id}},{id:"user.name",header:"Host Name",accessorFn:t=>t.user.name},{id:"Host ID",header:"Host ID",accessorFn:t=>{var e;return(e=t.order.products[0].owner)==null?void 0:e.id}},{id:"Host Email",header:"Host Email",accessorFn:t=>{var e;return(e=t.order.products[0].owner)==null?void 0:e.email}},{id:"order.user.name",header:"Guest Name",accessorFn:t=>{var e;return(e=t.order.user)==null?void 0:e.name}},{id:"row.order.user.id",header:"Guest ID",accessorFn:t=>{var e;return(e=t.order.user)==null?void 0:e.id}},{id:"order.user.email",header:"Guest Email",accessorFn:t=>{var e;return(e=t.order.user)==null?void 0:e.email}},{id:"refund",header:"Type",accessorFn:t=>{const e=t.refund,a=t.payouts.length;return e?"Guest Refund":a?"Host Payout":"Guest Booking"}},{id:"cancelation",header:"Refund Type",accessorFn:t=>{var a;const e=(a=t.cancelation)==null?void 0:a.policy;return e?e=="Partial refund"?"50% refund":e:"N/A"}},{id:"amount",header:"Amount",accessorFn:t=>{const e=(t.amount??0).toFixed(2);return t.type==="debit"?`+$${e}`:` -$${e*-1}`},Cell:({renderedCellValue:t,row:e})=>{const d=e.original.type==="credit"?"text-red-500":"text-green-500";return o("span",{className:d,children:[" ",t," "]})}}],x=({query:t,tableName:e,control:a})=>{const d=l.useMemo(()=>q,[]);return o(D,{children:[r("div",{className:"w-full",children:r(N,{extra:"sm:overflow-auto p-4",children:o("div",{className:"relative flex items-center justify-between overflow-scroll",children:[r("div",{className:"text-xl font-bold text-navy-700 ",children:e}),a]})})}),r(g,{columns:d,...t})]})};x.propTypes={query:c.array.isRequired,tableName:c.string.isRequired,control:c.element};const j=()=>{var u,m;const[t,e]=l.useState(h().set("date",1)),[a,d]=l.useState(h().set("date",1).add(1,"month").subtract(1,"day")),i=b({queryKey:["ledger",t,a],queryFn:async(s,p)=>(await f.get("/ledger",{params:{startDate:t.toDate(),endDate:a.toDate(),...s},signal:p})).data}),{data:n}=v({queryKey:["ledger-total",t,a],queryFn:async({signal:s})=>(await f.get("/ledger/total",{params:{startDate:t.toDate(),endDate:a.toDate()},signal:s})).data});return o("div",{children:[r("div",{className:"mt-5 grid h-full grid-cols-1 gap-5",children:r(x,{...i,tableName:"Ledger",control:o("div",{className:"flex flex-row justify-between",children:[o("div",{className:"flex flex-row justify-between gap-2 mr-2 items-center",children:[r("div",{className:"w-[100%]"}),r(y,{value:t,format:"DD MMM,  YYYY",onChange:s=>{e(s)},slotProps:{textField:{size:"small",variant:"outlined"}},sx:{input:{"--tw-ring-shadow":"0 0 #000 !important"},border:"1px solid black",width:"100%"}}),r("div",{className:"mx-4",children:" to "}),r(y,{value:a,format:"DD MMM,  YYYY",onChange:s=>{d(s)},slotProps:{textField:{size:"small"}},className:"min-h-fit",sx:{input:{"--tw-ring-shadow":"0 0 #000 !important"},border:"1px solid black",width:"100%"}})]}),r(F,{variant:"contained",color:"primary",onClick:i.query.refetch,disabled:i.query.isRefetching,className:"flex-row flex",children:i.query.isRefetching?r(w,{size:20,className:"mx-4"}):" Fetch"})]})})}),r("div",{className:"flex flex-row justify-end pt-7",children:r("div",{className:"flex flex-col items-end justify-end",children:o("div",{className:"text-lg text-navy-700 border-t-4 border-black pl-10 text-right",children:["Previous Amount: ",(((u=n==null?void 0:n.previous)==null?void 0:u.total)??0).toFixed(2),r("br",{}),"Total Amount: ",(((m=n==null?void 0:n.current)==null?void 0:m.total)??0).toFixed(2)]})})})]})};export{j as default};
