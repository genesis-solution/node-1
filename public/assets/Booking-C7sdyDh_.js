import{r as i,k as L,Q as S,l as e,bF as O,bG as Q,n as a,ac as s,ad as l,S as $,w as c}from"./index-7VV-N64s.js";import{B as N}from"./BetterTimePicker-iUuzyWXw.js";import"./index-BJg3HNK-.js";import"./transition-Crwx9Jvs.js";function H({open:T,onClose:u,order:t,refetch:g}){var h,b,v,y,x,f;const r=(h=t==null?void 0:t.rent)==null?void 0:h.start,k=(b=t==null?void 0:t.rent)==null?void 0:b.end,D=new Date(r??new Date),[_,C]=i.useState(D),B=new Date(r??new Date),I=new Date(k??new Date),[p,R]=i.useState(B),[o,j]=i.useState(I),q=(y=(v=t==null?void 0:t.products)==null?void 0:v[0])==null?void 0:y.guests,F=t==null?void 0:t.amount,[d,E]=i.useState(q),[m,G]=i.useState(F),P=(x=t==null?void 0:t.payment)==null?void 0:x.status,A=(f=t==null?void 0:t.payment)==null?void 0:f.transactionId,z=i.useCallback(async n=>{n.preventDefault();try{const w={start_time:p,end_time:o,guests:d,amount:m};await L.put(`/api/bookings/${t.id}`,w),S.success("Booking updated successfully!"),g(),u()}catch{S.error("Failed to update booking")}},[p,o,d,m,t.id,u,g]);return T?e("div",{className:"fixed inset-0 max-md:mb-7 flex items-center flex-wrap w-screen overflow-auto  backdrop-blur-xl justify-center z-50 bg-black bg-opacity-50",children:e("div",{className:"bg-white mr-0 p-8 rounded-lg shadow-lg max-w-lg w-full",children:e(O,{className:"h-full w-full",children:e(Q,{children:a("form",{className:"py-3",onSubmit:z,children:[a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Booking Date"}),e(l,{type:"date",value:_.toISOString().split("T")[0],onChange:n=>C(new Date(n.target.value))})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Booking Start Time"}),e(N,{value:p,onChange:R})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Booking End Time"}),e(N,{value:o,onChange:j})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Guests"}),e(l,{type:"number",value:d,onChange:n=>E(parseInt(n.target.value))})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Amount"}),e(l,{type:"number",value:m,onChange:n=>G(parseFloat(n.target.value))})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Transaction Status"}),a($,{value:P,disabled:!0,children:[e("option",{value:"completed",children:"Completed"}),e("option",{value:"pending",children:"Pending"}),e("option",{value:"failed",children:"Failed"})]})]}),a("div",{className:"grid gap-2 py-2 px-3",children:[e(s,{children:"Transaction ID"}),e(l,{type:"text",value:A,disabled:!0})]}),a("div",{className:"flex justify-between mt-4 px-3",children:[e("button",{className:"bg-red-500 text-white px-4 py-2 rounded-lg",onClick:u,children:"close"}),e("button",{type:"submit",className:"bg-blue-500 text-white px-4 py-2 rounded-lg",children:"Save Changes"})]})]})})})})}):null}H.propTypes={open:c.bool.isRequired,onClose:c.func.isRequired,order:c.object.isRequired,refetch:c.func.isRequired};export{H as default};