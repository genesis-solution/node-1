const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Booking-DCSctc0s.js","assets/index-CYYMkemY.js","assets/index-CXDG4f7f.css","assets/BetterTimePicker-4mNBZ52D.js","assets/index-BiQ69Uv7.js","assets/transition-D9da72fo.js","assets/DialogFullscreen-x-GnnSsf.js","assets/Toolbar-vOywhSsd.js"])))=>i.map(i=>d[i]);
import{w as S,r as c,l as a,bF as E,bG as R,n as r,ac as b,ad as F,S as k,Q as I,k as v,bH as A,br as D,bl as U,bk as q,bm as M,F as _,bo as j,bp as B,bq as G}from"./index-CYYMkemY.js";import{u as H}from"./useBooking-a8R0x6U_.js";import{D as L}from"./DialogFullscreen-x-GnnSsf.js";import{R as P}from"./Reservations-CSlBBA74.js";import{C as K}from"./CalendarOutlined-B1t4GR24.js";import{D as $}from"./DownloadOutlined-C6t_CTfn.js";import{E as V}from"./EditOutlined-B7aMbCoQ.js";import"./Toolbar-vOywhSsd.js";import"./Calender-DpzEOgDa.js";import"./react-big-calendar.esm-DG5-TkVK.js";const W=["Out of stock","Order by mistake","Price is high","Wrong Address","Change in plans","Sudden travel restrictions","Booking error","Unforeseen circumstances","Health concerns","Weather-related issues","Venue availability changed","Event cancellation","Personal emergencies","Found a better option","Other"];function y({open:m,onClose:i,order:s}){var u,C;const[d,T]=c.useState(""),[h,g]=c.useState("");return a(L,{open:m,onClose:i,children:a("div",{className:"w-full h-full",children:a(E,{children:a(R,{children:r("div",{className:"p-4 w-full",children:[a("h1",{className:"text-xl font-bold mb-3",children:"Request Cancelation"}),r("form",{onSubmit:async o=>{o.preventDefault(),await I.promise(v.post("/cancelation",{order:s._id,reason:h||d}),{pending:"Sending request...",success:"Request sent successfully",error:{render({data:l}){var p,f,e;return((p=l==null?void 0:l.response)==null?void 0:p.status)===409?"Request already sent":((e=(f=l==null?void 0:l.response)==null?void 0:f.data)==null?void 0:e.message)||"Failed to send request"}}})},className:"flex flex-col gap-4 w-full h-full",children:[r("div",{className:"flex flex-col",children:[a(b,{htmlFor:"order",children:"Booking ID"}),a(F,{type:"text",id:"order",name:"order",value:s==null?void 0:s.id,margin:!0,disabled:!0})]}),r("div",{className:"flex flex-col",children:[a(b,{htmlFor:"name",children:"Name"}),a(F,{type:"text",id:"name",name:"name",value:(u=s==null?void 0:s.user)==null?void 0:u.name,margin:!0,disabled:!0})]}),r("div",{className:"flex flex-col",children:[a(b,{htmlFor:"email",children:"Email"}),a(F,{type:"email",id:"email",name:"email",value:(C=s==null?void 0:s.user)==null?void 0:C.email,margin:!0,disabled:!0})]}),r("div",{className:"flex flex-col",children:[a(b,{htmlFor:"reason",children:"Reason for Cancellation"}),r(k,{id:"reason",name:"reason",value:d,onChange:o=>{T(o.target.value),g("")},margin:!0,required:!0,children:[a("option",{value:"",children:"Select a reason"}),W.map((o,l)=>a("option",{value:o,children:o},l))]})]}),d==="Other"&&r("div",{className:"flex flex-col",children:[a(b,{htmlFor:"other",children:"Other Reason"}),a(F,{type:"text",id:"other",name:"other",value:h,onChange:o=>g(o.target.value),margin:!0,required:!0})]}),r("div",{className:"-mx-5 -mb-5 bg-[#F3F3F3] flex font-medium gap-3 px-4 py-2",children:[a("button",{className:"bg-brand-primary text-black py-1.5 px-3 rounded-md",type:"submit",children:"Submit"}),a("button",{className:"bg-transparent  border-[#696C80] border-2  text-[#696C80] px-3 py-2 rounded-md",type:"reset",children:"Cancel"})]})]})]})})})})})}y.propTypes={open:S.bool.isRequired,onClose:S.func.isRequired,order:S.object.isRequired};const z=c.lazy(()=>A(()=>import("./Booking-DCSctc0s.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])));function se(){var o,l,p,f;const m=H(),i=c.useRef(null),[s,d]=c.useState(!1),[T,h]=c.useState(!1),[g,N]=c.useState(!1);function u(e){return new Date(e).toLocaleString("en-US",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"numeric",hour12:!0,region:"UTC"})}console.log(m.data);const C=c.useMemo(()=>[{id:"id",header:"BOOKING ID",accessorFn:e=>e.id},{id:"hostid",header:"HOST ID",accessorFn:e=>e.products.map(n=>{var t;return(t=n==null?void 0:n.owner)==null?void 0:t.id}).join(", ")},{id:"hostName",header:"HOST NAME",accessorFn:e=>e.products.map(n=>{var t;return(t=n.owner)==null?void 0:t.name}).join(", ")},{id:"hostContact",header:"HOST CONTACT",accessorFn:e=>e.products.map(n=>{var t;return(t=n.owner)==null?void 0:t.email}).join(", ")},{id:"spotName",header:"SPOT NAME",accessorFn:e=>e.products.map(n=>{var t;return(t=n==null?void 0:n.product)==null?void 0:t.name}).join(", ")},{id:"user.id",header:"GUEST ID",accessorFn:e=>{var n;return(n=e==null?void 0:e.user)==null?void 0:n.id}},{id:"user.name",header:"GUEST NAME",accessorFn:e=>{var n;return(n=e==null?void 0:e.user)==null?void 0:n.name}},{id:"user.email",header:"GUEST EMAIL",accessorFn:e=>{var n;return(n=e==null?void 0:e.user)==null?void 0:n.email}},{id:"products.guests",header:"GUESTS",accessorFn:e=>{var n;return(n=e==null?void 0:e.products)==null?void 0:n.map(t=>t==null?void 0:t.guests).join(", ")}},{id:"rent.start",header:"CHECK-IN TIME",accessorFn:e=>{var n;return u((n=e==null?void 0:e.rent)==null?void 0:n.start)}},{id:"rent.end",header:"CHECK-OUT TIME",accessorFn:e=>{var n;return u((n=e==null?void 0:e.rent)==null?void 0:n.end)}},{id:"createdAt",header:"BOOKING TIME",accessorFn:e=>u(e==null?void 0:e.createdAt)},{id:"row.amount",header:"AMOUNT PAID BY GUEST",accessorFn:e=>(e.amount??0).toFixed(2),Cell:({renderedCellValue:e})=>r("span",{children:["$ ",e]})},{id:"transection.gateway",header:"Gateway",accessorFn:e=>{var n;return((n=e.transection)==null?void 0:n.gateway)??"Unknown"}},{id:"transection.id",header:"Transection ID",accessorFn:e=>{var n;return((n=e.transection)==null?void 0:n.id)??"Unknown"},enableClickToCopy:!0},{id:"transection.status",header:"TRANSACTION STATUS",accessorFn:e=>e.transection.status,Cell:({renderedCellValue:e})=>r("div",{className:"flex items-center",children:[e==="completed"?a(B,{className:"text-green-500"}):a(G,{className:"text-red-500"}),a("span",{className:"ml-2",children:e})]})},{id:"status",header:"STATUS",accessorFn:e=>e.status,Cell:({row:e})=>{const n=e.original.status;return a("span",{className:n==="confirmed"?"text-green-500":n==="cancelled"?"text-red-500":"text-yellow-500",children:n})}},{id:"action",header:"ACTION",Cell:({row:e})=>{const n=e.original._id;return a(M,{menu:{items:[{label:"Request Cancelation",icon:a(D,{}),onClick:()=>{i.current=e.original,d(!0)}},{label:"View Reservation",icon:a(K,{}),onClick:()=>{i.current=e.original,h(!0)}},{label:"Edit",icon:a(V,{}),onClick:()=>{console.log("Edit",n),i.current=e.original,N(!0)},disabled:!e.original.products[0].product},{label:"Download Invoice",icon:a($,{}),onClick:()=>{v.get(`${v.defaults.baseURL}/order/invoice/${n}`,{responseType:"blob"}).then(t=>{const O=window.URL.createObjectURL(new Blob([t.data])),x=document.createElement("a");x.href=O,x.setAttribute("download",`invoice_${n}.pdf`),document.body.appendChild(x),x.click()})}}]},children:a(U,{children:a(q,{})})})}}],[]);return r(_,{children:[a(j,{columns:C,...m}),a(y,{open:i.current&&s,onClose:()=>d(!1),order:i.current}),a(P,{open:i.current&&T,onClose:()=>h(!1),id:(f=(p=(l=(o=i.current)==null?void 0:o.products)==null?void 0:l[0])==null?void 0:p.product)==null?void 0:f._id}),a(z,{open:i.current&&g,onClose:()=>N(!1),order:i,refetch:m.query.refetch})]})}export{se as default};