import{w as c,r as l,l as n,b1 as T,aF as F,bm as b,k as N,Q as f,n as h,bp as g,bq as y,bo as D,F as P}from"./index-7VV-N64s.js";import{d as v}from"./Approval-P1nl9vXc.js";import{d as A}from"./KeyboardArrowDown-3G4cmplF.js";import{u as S}from"./usePayouts-QIuI3TXx.js";function x(s){const[u,e]=l.useState(!1),t=async()=>{try{e(!0);const r=await N.patch(`/payout/${s.id}`,{status:"paid"});f.success(r.data.message),s.refresh()}catch{f.error("Something went wrong while resolving")}e(!1)};return l.useEffect(()=>{console.log(s.id)},[s]),n(b,{menu:{items:[{icon:u?n(T,{size:20}):n(v,{}),label:"Paid",onClick:t,disabled:s.paid}]},children:n(F,{id:"demo-customized-button","aria-controls":open?"demo-customized-menu":void 0,"aria-haspopup":"true","aria-expanded":open?"true":void 0,variant:"outlined",color:"inherit",disableElevation:!0,endIcon:n(A,{}),disabled:s.disabled??!1,children:"Actions"})})}x.propTypes={id:c.string,paid:c.bool,refresh:c.func,disabled:c.bool};const E=()=>{const s=S(),u=l.useMemo(()=>[{id:"user.id",header:"Host ID",accessorFn:e=>e.user.id??"N/A"},{id:"order.id",header:"BOOKING ID",accessorFn:e=>{var t;return(t=e.order)==null?void 0:t.id}},{id:"spotId",header:"SPOT ID",accessorFn:e=>{var t,r,a;return(a=(r=(t=e.order)==null?void 0:t.products)==null?void 0:r[0].product)==null?void 0:a.id}},{id:"spot",header:"Spot",accessorFn:e=>{var t,r,a;return`${(a=(r=(t=e.order)==null?void 0:t.products)==null?void 0:r[0].product)==null?void 0:a.name}`}},{id:"user.name",header:"HOST NAME",accessorFn:e=>{var t;return(t=e.user)==null?void 0:t.name}},{id:"order.user.name",header:"GUEST NAME",accessorFn:e=>{var t,r;return(r=(t=e.order)==null?void 0:t.user)==null?void 0:r.name}},{id:"order.user.id",header:"GUEST ID",accessorFn:e=>{var t,r;return((r=(t=e.order)==null?void 0:t.user)==null?void 0:r.id)??"N/A"}},{id:"payoutAmount",header:"Payout Amount",accessorFn:e=>"$"+e.amount.toFixed(2)},{id:"orderAmount",header:"Order Amount",accessorFn:e=>{const t=new Date(e.order.rent.start).getTime(),r=new Date(e.order.rent.end).getTime(),a=Math.ceil((r-t)/36e5);return"$"+e.order.products.map(d=>d.amount*a-(d.discount??0)).reduce((d,i)=>d+i,0).toFixed(2)}},{id:"amountPaidByGuest",header:"Amount Paid By Guest",accessorFn:e=>{var t;return"$"+((t=e.order)==null?void 0:t.amount.toFixed(2))}},{id:"eventStatus",header:"Event Status",accessorFn:e=>{var o,d,i,m,p;if((o=e.cancelation)!=null&&o.policy)return"not started";const t=new Date((i=(d=e.order)==null?void 0:d.rent)==null?void 0:i.start).getTime(),r=new Date((p=(m=e.order)==null?void 0:m.rent)==null?void 0:p.end).getTime(),a=new Date().getTime();return a>r?"ended":a>=t?"started":a<t?"not started":"ended"},Cell:({renderedCellValue:e})=>h("div",{className:"flex items-center gap-2",children:[n("div",{className:"rounded-full text-xl",children:e==="started"||e==="ended"?n(g,{className:"text-green-500"}):e==="not started"?n(y,{className:"text-red-500"}):null}),n("p",{className:"text-sm font-bold text-navy-700 ",children:e})]})},{id:"order.rent.start",header:"Event Start Time",accessorFn:e=>{var t;return new Date((t=e.order)==null?void 0:t.rent.start).toLocaleString()}},{id:"payoutType",header:"Payout Type",accessorFn:e=>{var t;return(t=e.cancelation)!=null&&t.policy?"Order Cancel":"Booking"}},{id:"refundType",header:"Refund Type",accessorFn:e=>{var t,r,a;return(t=e.cancelation)!=null&&t.policy?((r=e.cancelation)==null?void 0:r.policy)==="Partial refund"?"50% refund":((a=e.cancelation)==null?void 0:a.policy)==="No refund"?"No refund":"TODO":"NA"}},{id:"status",header:"Paid",accessorFn:e=>{const t=e.status==="paid";return h("div",{className:"flex items-center gap-2",children:[n("div",{className:"rounded-full text-xl",children:t?n(g,{className:"text-green-500"}):n(y,{className:"text-red-500"})}),n("p",{className:"text-sm font-bold text-navy-700 ",children:e.status})]})}},{id:"actions",header:"Actions",Cell:({row:e})=>{var a,o,d;const t=new Date().getTime()<new Date((a=e.original.order)==null?void 0:a.rent.start).getTime(),r=!((d=(o=e.original)==null?void 0:o.cancelation)!=null&&d.policy);return n(x,{id:e.original._id,paid:e.original.status==="paid",refresh:s.query.refetch,disabled:e.original.status==="paid"||t&&r})}}],[s.query.refetch]);return n(P,{children:n(D,{columns:u,...s})})};function w(){return n(E,{})}export{w as default};
