import{r as i,l as e,n as t,dg as Y,k as W,L as P,F as J,b5 as te,a9 as le,bG as ne}from"./index-7VV-N64s.js";import{u as K}from"./useBooking-BmA3KNKF.js";import{u as se}from"./socket-2ELdkvWa.js";import{R as ie}from"./Reviews-DTzuv8vT.js";import"./Calender-sMoGW9kL.js";import"./index-BJg3HNK-.js";import"./useReviews-y2EBonKG.js";import"./ChangeView-CDkdWtqO.js";import"./react-big-calendar.esm-BZcNkvgM.js";const Q="/assets/image-D4GEC_Z0.png",ce=()=>{var O,q,_;const s=K(),[a,C]=i.useState(window.innerWidth<620),[x,N]=i.useState(null),[$,f]=i.useState(!1),[h,Z]=i.useState(null);console.log(window.innerWidth<620),i.useEffect(()=>{window.addEventListener("resize",()=>{C(window.innerWidth<620)})},[window.innerWidth]);const[u,R]=i.useState(!1),[v,V]=i.useState(null),A=l=>{Z(h===l?null:l)},I=l=>{V(l),R(()=>!u)},F=l=>{if(l){const{start:p,end:m}=l,r=new Date(p).toLocaleString(),b=new Date(m).toLocaleString();return t("div",{children:[t("div",{className:"flex gap-2 items-end ",children:[e("span",{children:e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 30",width:"24px",height:"24px",fill:"none",x:"0px",y:"0px",children:e("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3 2C2.44772 2 2 2.44772 2 3C2 3.55228 2.44772 4 3 4H4.17071C4.06015 4.31278 4 4.64936 4 5V7.33333C4 7.98244 4.21053 8.61404 4.6 9.13333L6.75 12L4.6 14.8667C4.21053 15.386 4 16.0176 4 16.6667V19C4 19.3506 4.06015 19.6872 4.17071 20H3C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H19.8293C19.9398 19.6872 20 19.3506 20 19V16.6667C20 16.0176 19.7895 15.386 19.4 14.8667L17.25 12L19.4 9.13333C19.7895 8.61404 20 7.98244 20 7.33333V5C20 4.64936 19.9398 4.31278 19.8293 4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H3ZM12 12C12.9717 12 13.8721 11.4902 14.372 10.657L16.8575 6.5145C17.0429 6.20556 17.0477 5.82081 16.8702 5.5073C16.6927 5.19379 16.3603 5 16 5L8 5C7.63973 5 7.30731 5.19379 7.1298 5.5073C6.95229 5.82081 6.95715 6.20556 7.14251 6.51449L9.62801 10.657C10.1279 11.4902 11.0283 12 12 12Z",fill:"Currentcolor"})})}),": ",r]}),t("div",{className:"flex gap-2 items-end ",children:[e("span",{children:e("svg",{xmlns:"http://www.w3.org/2000/svg",className:"rotate-180",viewBox:"0 0 24 30",width:"24px",height:"24px",fill:"none",x:"0px",y:"0px",children:e("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3 2C2.44772 2 2 2.44772 2 3C2 3.55228 2.44772 4 3 4H4.17071C4.06015 4.31278 4 4.64936 4 5V7.33333C4 7.98244 4.21053 8.61404 4.6 9.13333L6.75 12L4.6 14.8667C4.21053 15.386 4 16.0176 4 16.6667V19C4 19.3506 4.06015 19.6872 4.17071 20H3C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H19.8293C19.9398 19.6872 20 19.3506 20 19V16.6667C20 16.0176 19.7895 15.386 19.4 14.8667L17.25 12L19.4 9.13333C19.7895 8.61404 20 7.98244 20 7.33333V5C20 4.64936 19.9398 4.31278 19.8293 4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H3ZM12 12C12.9717 12 13.8721 11.4902 14.372 10.657L16.8575 6.5145C17.0429 6.20556 17.0477 5.82081 16.8702 5.5073C16.6927 5.19379 16.3603 5 16 5L8 5C7.63973 5 7.30731 5.19379 7.1298 5.5073C6.95229 5.82081 6.95715 6.20556 7.14251 6.51449L9.62801 10.657C10.1279 11.4902 11.0283 12 12 12Z",fill:"Currentcolor"})})})," ",": ",b]})]})}};return e(J,{children:t("div",{className:"flex flex-wrap max-sm:mb-10 duration-200 gap-4 px-1 -mr-6 min-h-[63vh]",children:[$&&x&&e("div",{className:"fixed w-[79vw] -ml-20 top-0 h-screen  ",children:e("div",{className:"flex justify-center items-center h-full w-full  ",children:e(re,{data:x,sethostdeatils:f})})}),u&&v&&e("div",{className:"fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50",children:t("div",{className:"bg-white p-8 rounded-lg shadow-lg max-w-lg w-full",children:["// eslint-disable-next-line react/jsx-no-undef",e(Booking,{open:u,onClose:()=>R(!1),order:v,refetch:s.query.refetch})]})}),a?e("div",{children:(O=s.data)==null?void 0:O.filter(l=>new Date(l.createdAt)>new Date).map(l=>{var p,m,r;return t("div",{className:`flex flex-col items-center border-2 border-zinc-300 max-sm:w-full duration-200 justify-between p-4 bg-white rounded-lg shadow-md lg:w-full ${h===l.id?"h-50":"h-34"}`,children:[console.log("Row:",l),t("div",{className:"flex w-full justify-between items-start",children:[t("div",{className:"flex items-center flex-col gap-4",children:[t("div",{className:"bg-brand-primary text-black rounded-full flex justify-center items-center px-3 py-1 text-sm font-bold",children:[e("span",{children:"#"})," ",e("span",{children:l.id})]}),e("div",{children:e("h2",{className:"text-lg font-semibold",children:(p=l.user)==null?void 0:p.name})})]}),t("div",{className:"flex flex-col items-center justify-center bg-white rounded-lg w-24 h-24 text-black relative overflow-hidden",children:[e("img",{src:Q,alt:""}),t("div",{className:"absolute",children:[e("p",{className:"text-4xl font-['fjord-one-regular']",children:new Date(l.rent.start).getDate()}),e("p",{className:"text-sm",children:new Date(l.rent.start).toLocaleString("default",{month:"long"})}),e("p",{className:"text-sm",children:new Date(l.rent.start).getFullYear()})]})]})]}),h===l.id&&t("div",{className:"mt-4 w-full",children:[t("p",{className:"text-sm text-gray-600 flex items-center gap-1",children:["Email: ",t("span",{children:[(m=l.user)==null?void 0:m.email," "]})]}),t("div",{className:"flex items-center gap-2 text-sm text-gray-600 mt-2",children:[e("span",{children:t("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e("path",{d:"M15.7035 6.5625C15.5891 8.15117 14.4106 9.375 13.1254 9.375C11.8403 9.375 10.6598 8.15156 10.5473 6.5625C10.4301 4.90977 11.5774 3.75 13.1254 3.75C14.6735 3.75 15.8207 4.93984 15.7035 6.5625Z",stroke:"black",strokeLinecap:"round",strokeLinejoin:"round"}),e("path",{d:"M13.1248 11.875C10.5791 11.875 8.1311 13.1395 7.51781 15.602C7.43656 15.9277 7.64086 16.25 7.97563 16.25H18.2745C18.6092 16.25 18.8123 15.9277 18.7323 15.602C18.119 13.1 15.6709 11.875 13.1248 11.875Z",stroke:"black",strokeMiterlimit:"10"}),e("path",{d:"M7.81214 7.26328C7.72073 8.53203 6.76839 9.53125 5.74183 9.53125C4.71527 9.53125 3.76136 8.53242 3.67152 7.26328C3.57816 5.94336 4.50511 5 5.74183 5C6.97855 5 7.9055 5.96758 7.81214 7.26328Z",stroke:"black",strokeLinecap:"round",strokeLinejoin:"round"}),e("path",{d:"M8.04726 11.9531C7.34218 11.6301 6.56562 11.5059 5.74257 11.5059C3.71132 11.5059 1.75429 12.5156 1.26405 14.4824C1.1996 14.7426 1.36288 15 1.63007 15H6.01601",stroke:"black",strokeMiterlimit:"10",strokeLinecap:"round"})]})}),t("span",{children:[": ",((r=l.products[0])==null?void 0:r.guests)||0]})]}),t("div",{className:"flex justify-start mt-2 text-zinc-700 flex-col",children:[l&&F(l==null?void 0:l.rent),t("div",{className:"flex items-end gap-3 ",children:[t("span",{className:"text-lg text-center ml-2 font-bold",children:["$"," "]})," ",t("span",{className:"",children:[": ",l.amount]})]})]}),t("div",{className:"flex justify-end gap-2 mt-4",children:[e("button",{className:"bg-blue-500 text-white px-4 py-2 rounded-lg",onClick:()=>I(l),children:"Edit"}),e("button",{className:"bg-red-500 text-white px-4 py-2 rounded-lg",children:"Cancel"})]})]}),e(Y,{onClick:()=>A(l.id),className:`text-gray-500 cursor-pointer duration-500 w-16 h-6 mt-2 ${h===l.id?"rotate-180":"rotate-0"}`})]},l.id)})}):(q=s.data)==null?void 0:q.filter(l=>new Date(l.createdAt)>new Date).map((l,p)=>{var m,r,b,k,n,c,o,d,g,L,y,j,S,H,M,D,E,B;return t("div",{className:"w-full h-[40vh] border-2 border-black rounded-xl px-12",children:[t("div",{className:"w-full border-b-2 border-black flex justify-between items-center py-4",children:[t("div",{className:"",children:[e("h1",{className:"text-base font-semibold text-black ",children:"Spot Booked On"}),e("p",{className:"text-sm text-black ",children:new Date(l.createdAt).toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})})]}),t("div",{className:"",children:[e("h1",{className:"text-base font-semibold text-black ",children:"Amount Paid"}),t("p",{className:"text-sm text-black font-semibold ",children:["$ ",l.amount]})]}),t("div",{className:"",children:[e("h1",{className:"text-base font-semibold text-black ",children:"Number Of Guests"}),e("p",{className:"text-sm text-black font-semibold",children:(m=l.products[0])==null?void 0:m.guests})]}),t("div",{className:"",children:[e("h1",{className:"text-base font-semibold text-black ",children:"Event date"}),e("p",{className:"text-sm text-black ",children:new Date((r=l.rent)==null?void 0:r.start).toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})})]}),t("div",{className:"",children:[e("h1",{className:"text-base font-semibold text-black ",children:"Event Time"}),t("p",{className:"text-sm text-black ",children:[new Date((b=l.rent)==null?void 0:b.start).toLocaleString("default",{hour:"numeric",minute:"numeric"})," ","to"," ",new Date((k=l.rent)==null?void 0:k.end).toLocaleString("default",{hour:"numeric",minute:"numeric"})]})]}),t("div",{className:"w-fit flex flex-col h-full justify-between items-center text-black",children:[t("p",{className:"font-bold",children:["Booking ID: ",l.id]}),t("div",{className:"flex gap-3 h-4",children:[e("button",{className:"text-sm font-semibold text-black underline ",children:"view booking details"}),e("div",{className:"w-2  border-l-2 border-black"}),e("button",{onClick:()=>{W.get(`${W.defaults.baseURL}/invoice/${l._id}`,{responseType:"blob"}).then(z=>{const U=window.URL.createObjectURL(new Blob([z.data])),w=document.createElement("a");w.href=U,w.setAttribute("download",`invoice_${_id}.pdf`),document.body.appendChild(w),w.click()})},className:"text-sm font-semibold text-black underline ",children:"Invoice"})]})]})]}),t("div",{className:"flex justify-between  h-[72%]",children:[t("div",{className:"w-[80%] h-full  flex items-start mt-6  gap-7",children:[e("div",{children:e("img",{src:(n=l==null?void 0:l.products[0].product)==null?void 0:n.images[0],className:"size-[150px]   object-cover rounded-lg",alt:"image"})}),t("div",{children:[e("div",{children:`${(o=(c=l==null?void 0:l.products[0].product)==null?void 0:c.location)==null?void 0:o.address}, ${(g=(d=l==null?void 0:l.products[0].product)==null?void 0:d.location)==null?void 0:g.city}, ${(y=(L=l==null?void 0:l.products[0].product)==null?void 0:L.location)==null?void 0:y.state}, ${(S=(j=l==null?void 0:l.products[0].product)==null?void 0:j.location)==null?void 0:S.zipCode}, ${(M=(H=l==null?void 0:l.products[0].product)==null?void 0:H.location)==null?void 0:M.country}`}),t("div",{children:[e("p",{className:" font-semibold ",children:"Spot discription"}),e("p",{children:(D=l==null?void 0:l.products[0].product)==null?void 0:D.description})]})]})]}),t("div",{className:"w-[20%] h-full  py-3 flex flex-col gap-2",children:[e("button",{onClick:()=>{f(!0),N(l)},className:"w-full rounded-full h-7 border-2 border-black text-black font-semibold",children:"Host Details"}),console.log(l.products[0]),e(oe,{spotDetails:l.products[0]}),e(P,{to:`/spot/${(B=(E=l==null?void 0:l.products[0])==null?void 0:E.product)==null?void 0:B.id}?view=Overview`,className:"w-full rounded-full h-7 border-2 border-black text-center hover:text-black text-black font-semibold",children:"View Spot"}),e(P,{to:"/user/cancelation?view=support",className:"w-full rounded-full h-7 border-2 border-black text-black font-semibold text-center hover:text-black",children:"Cancellation"}),e(P,{to:"/user/support?view=support",className:"w-full rounded-full h-7 border-2 border-black text-black font-semibold text-center hover:text-black",children:"Support"})]})]})]},p)}),((_=s.data)==null?void 0:_.filter(l=>new Date(l.createdAt)>new Date).length)===0&&e("div",{className:"w-full flex justify-center items-center",children:e("p",{className:"text-lg font-semibold text-gray-500",children:"No Upcoming Bookings"})})]})})},re=({data:s,sethostdeatils:a})=>t("div",{className:"flex items-center border rounded-lg p-4 px-9 shadow-lg max-w-sm relative bg-white",children:[e("div",{className:"w-16 h-16 bg-gray-300 rounded-full"}),t("div",{className:"ml-4",children:[t("p",{className:"text-lg font-semibold",children:["Host Name: ",s.name]}),t("p",{className:"text-md text-gray-600",children:["Email: ",s.email]})]}),e("button",{className:"absolute top-2 right-2   rounded-full w-6 h-6 flex items-center justify-center",onClick:()=>a(!1),children:e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24",fill:"currentColor",children:e("path",{d:"M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"})})})]});function oe({spotDetails:s}){const a=se(),C=te(),x=f=>{const h=s.owner;a.emit("sendMessage",{chat:h,message:f})},N=()=>` I booked your spot which is located at ${`${s==null?void 0:s.product.location.address}, ${s==null?void 0:s.product.location.city}`}. I have some questions about it.`;return console.log(N()),e("button",{onClick:()=>{x(N()),C("/user/messages?view=private")},className:"w-full rounded-full h-7 border-2 border-black text-black font-semibold",children:"Message Host"})}const de=()=>{var r,b,k;const s=K(),[a,C]=i.useState(window.innerWidth<620),[x,N]=i.useState(null),[$,f]=i.useState(!1),[h,Z]=i.useState(null),[u,R]=i.useState(null);console.log(window.innerWidth<620),i.useEffect(()=>{window.addEventListener("resize",()=>{C(window.innerWidth<620)})},[window.innerWidth]);const[v,V]=i.useState(!1),[A,I]=i.useState(null),[F,O]=i.useState(null),[q,_]=i.useState(null),l=n=>{R(u===n?null:n)},p=n=>{I(n),V(()=>!v)},m=n=>{if(n){const{start:c,end:o}=n,d=new Date(c).toLocaleString(),g=new Date(o).toLocaleString();return t("div",{children:[t("div",{className:"flex gap-2 items-end ",children:[e("span",{children:e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 30",width:"24px",height:"24px",fill:"none",x:"0px",y:"0px",children:e("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3 2C2.44772 2 2 2.44772 2 3C2 3.55228 2.44772 4 3 4H4.17071C4.06015 4.31278 4 4.64936 4 5V7.33333C4 7.98244 4.21053 8.61404 4.6 9.13333L6.75 12L4.6 14.8667C4.21053 15.386 4 16.0176 4 16.6667V19C4 19.3506 4.06015 19.6872 4.17071 20H3C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H19.8293C19.9398 19.6872 20 19.3506 20 19V16.6667C20 16.0176 19.7895 15.386 19.4 14.8667L17.25 12L19.4 9.13333C19.7895 8.61404 20 7.98244 20 7.33333V5C20 4.64936 19.9398 4.31278 19.8293 4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H3ZM12 12C12.9717 12 13.8721 11.4902 14.372 10.657L16.8575 6.5145C17.0429 6.20556 17.0477 5.82081 16.8702 5.5073C16.6927 5.19379 16.3603 5 16 5L8 5C7.63973 5 7.30731 5.19379 7.1298 5.5073C6.95229 5.82081 6.95715 6.20556 7.14251 6.51449L9.62801 10.657C10.1279 11.4902 11.0283 12 12 12Z",fill:"Currentcolor"})})}),": ",d]}),t("div",{className:"flex gap-2 items-end ",children:[e("span",{children:e("svg",{xmlns:"http://www.w3.org/2000/svg",className:"rotate-180",viewBox:"0 0 24 30",width:"24px",height:"24px",fill:"none",x:"0px",y:"0px",children:e("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M3 2C2.44772 2 2 2.44772 2 3C2 3.55228 2.44772 4 3 4H4.17071C4.06015 4.31278 4 4.64936 4 5V7.33333C4 7.98244 4.21053 8.61404 4.6 9.13333L6.75 12L4.6 14.8667C4.21053 15.386 4 16.0176 4 16.6667V19C4 19.3506 4.06015 19.6872 4.17071 20H3C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H19.8293C19.9398 19.6872 20 19.3506 20 19V16.6667C20 16.0176 19.7895 15.386 19.4 14.8667L17.25 12L19.4 9.13333C19.7895 8.61404 20 7.98244 20 7.33333V5C20 4.64936 19.9398 4.31278 19.8293 4H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H3ZM12 12C12.9717 12 13.8721 11.4902 14.372 10.657L16.8575 6.5145C17.0429 6.20556 17.0477 5.82081 16.8702 5.5073C16.6927 5.19379 16.3603 5 16 5L8 5C7.63973 5 7.30731 5.19379 7.1298 5.5073C6.95229 5.82081 6.95715 6.20556 7.14251 6.51449L9.62801 10.657C10.1279 11.4902 11.0283 12 12 12Z",fill:"Currentcolor"})})})," ",": ",g]})]})}};return e(J,{children:t("div",{className:"flex flex-wrap max-sm:mb-10 duration-200 gap-4 px-1 -mr-6 min-h-[63vh]",children:[$&&x&&e("div",{className:"fixed w-[79vw] -ml-20 top-0 h-screen  ",children:e("div",{className:"flex justify-center items-center h-full w-full  ",children:e(ae,{data:x,sethostdeatils:f})})}),v&&A&&e("div",{className:"fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50",children:t("div",{className:"bg-white p-8 rounded-lg shadow-lg max-w-lg w-full",children:["// eslint-disable-next-line react/jsx-no-undef",e(Booking,{open:v,onClose:()=>V(!1),order:A,refetch:s.query.refetch})]})}),a?e("div",{children:(r=s.data)==null?void 0:r.filter(n=>new Date(n.createdAt)<new Date).map(n=>{var c,o,d;return t("div",{className:`flex flex-col items-center border-2 border-zinc-300 max-sm:w-full duration-200 justify-between p-4 bg-white rounded-lg shadow-md lg:w-full ${u===n.id?"h-50":"h-34"}`,children:[console.log("Row:",n),t("div",{className:"flex w-full justify-between items-start",children:[t("div",{className:"flex items-center flex-col gap-4",children:[t("div",{className:"bg-brand-primary text-black rounded-full flex justify-center items-center px-3 py-1 text-xs font-bold",children:[e("span",{children:"#"})," ",e("span",{children:n.id})]}),e("div",{children:e("h2",{className:"text-lg font-semibold",children:(c=n.user)==null?void 0:c.name})})]}),t("div",{className:"flex flex-col items-center justify-center bg-white rounded-lg w-24 h-24 text-black relative overflow-hidden",children:[e("img",{src:Q,alt:""}),t("div",{className:"absolute",children:[e("p",{className:"text-4xl font-['fjord-one-regular']",children:new Date(n.rent.start).getDate()}),e("p",{className:"texs-sm",children:new Date(n.rent.start).toLocaleString("default",{month:"long"})}),e("p",{className:"texs-sm",children:new Date(n.rent.start).getFullYear()})]})]})]}),u===n.id&&t("div",{className:"mt-4 w-full",children:[t("p",{className:"text-xs text-gray-600 flex items-center gap-1",children:["Email: ",t("span",{children:[(o=n.user)==null?void 0:o.email," "]})]}),t("div",{className:"flex items-center gap-2 text-xs text-gray-600 mt-2",children:[e("span",{children:t("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e("path",{d:"M15.7035 6.5625C15.5891 8.15117 14.4106 9.375 13.1254 9.375C11.8403 9.375 10.6598 8.15156 10.5473 6.5625C10.4301 4.90977 11.5774 3.75 13.1254 3.75C14.6735 3.75 15.8207 4.93984 15.7035 6.5625Z",stroke:"black",strokeLinecap:"round",strokeLinejoin:"round"}),e("path",{d:"M13.1248 11.875C10.5791 11.875 8.1311 13.1395 7.51781 15.602C7.43656 15.9277 7.64086 16.25 7.97563 16.25H18.2745C18.6092 16.25 18.8123 15.9277 18.7323 15.602C18.119 13.1 15.6709 11.875 13.1248 11.875Z",stroke:"black",strokeMiterlimit:"10"}),e("path",{d:"M7.81214 7.26328C7.72073 8.53203 6.76839 9.53125 5.74183 9.53125C4.71527 9.53125 3.76136 8.53242 3.67152 7.26328C3.57816 5.94336 4.50511 5 5.74183 5C6.97855 5 7.9055 5.96758 7.81214 7.26328Z",stroke:"black",strokeLinecap:"round",strokeLinejoin:"round"}),e("path",{d:"M8.04726 11.9531C7.34218 11.6301 6.56562 11.5059 5.74257 11.5059C3.71132 11.5059 1.75429 12.5156 1.26405 14.4824C1.1996 14.7426 1.36288 15 1.63007 15H6.01601",stroke:"black",strokeMiterlimit:"10",strokeLinecap:"round"})]})}),t("span",{children:[": ",((d=n.products[0])==null?void 0:d.guests)||0]})]}),t("div",{className:"flex justify-start mt-2 text-zinc-700 flex-col",children:[n&&m(n==null?void 0:n.rent),t("div",{className:"flex items-end gap-3 ",children:[t("span",{className:"text-lg text-center ml-2 font-bold",children:["$"," "]})," ",t("span",{className:"",children:[": ",n.amount]})]})]}),t("div",{className:"flex justify-end gap-2 mt-4",children:[e("button",{className:"bg-blue-500 text-white px-4 py-2 rounded-lg",onClick:()=>p(n),children:"Edit"}),e("button",{className:"bg-red-500 text-white px-4 py-2 rounded-lg",children:"Cancel"})]})]}),e(Y,{onClick:()=>l(n.id),className:`text-gray-500 cursor-pointer duration-500 w-16 h-6 mt-2 ${u===n.id?"rotate-180":"rotate-0"}`})]},n.id)})}):(b=s.data)==null?void 0:b.filter(n=>new Date(n.createdAt)<new Date).map((n,c)=>{var o,d,g,L,y,j,S,H,M,D,E,B,z,U,w,G;return t("div",{className:"w-full h-[40vh] border-2 border-black rounded-xl px-12",children:[t("div",{className:"w-full border-b-2 border-black flex justify-between items-center py-4 gap-3",children:[t("div",{className:"",children:[e("h1",{className:"text-sm font-semibold text-black ",children:"Spot Booked On"}),e("p",{className:"text-xs text-black ",children:new Date(n.createdAt).toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})})]}),t("div",{className:"",children:[e("h1",{className:"text-sm font-semibold text-black ",children:"Amount Paid"}),t("p",{className:"text-xs text-black ",children:["$ ",n.amount]})]}),t("div",{className:"",children:[e("h1",{className:"text-sm font-semibold text-black ",children:"Number Of Guests"}),e("p",{className:"text-xs text-black ",children:(o=n.products[0])==null?void 0:o.guests})]}),t("div",{className:"",children:[e("h1",{className:"text-sm font-semibold text-black ",children:"Event date"}),e("p",{className:"text-xs text-black ",children:new Date((d=n.rent)==null?void 0:d.start).toLocaleString("default",{month:"long",day:"numeric",year:"numeric"})})]}),t("div",{className:"",children:[e("h1",{className:"text-sm font-semibold text-black ",children:"Event Time"}),t("p",{className:"text-xs text-black ",children:[new Date((g=n.rent)==null?void 0:g.start).toLocaleString("default",{hour:"numeric",minute:"numeric"})," ","to"," ",new Date((L=n.rent)==null?void 0:L.end).toLocaleString("default",{hour:"numeric",minute:"numeric"})]})]}),t("div",{className:"w-fit flex flex-col h-full justify-between items-center  text-black",children:[t("p",{className:"font-bold text-sm",children:["Booking ID: ",n.id]}),t("div",{className:"flex gap-3 h-4",children:[e("button",{className:"text-xs font-semibold text-black underline ",children:"view booking details"}),e("div",{className:"w-2   border-l-2 border-black"}),e("button",{onClick:()=>{W.get(`${W.defaults.baseURL}/invoice/${n._id}`,{responseType:"blob"}).then(X=>{const ee=window.URL.createObjectURL(new Blob([X.data])),T=document.createElement("a");T.href=ee,T.setAttribute("download",`invoice_${_id}.pdf`),document.body.appendChild(T),T.click()})},className:"text-xs font-semibold -ml-3 text-black underline ",children:"Invoice"})]})]})]}),t("div",{className:"flex justify-between  h-[72%]",children:[t("div",{className:"w-[80%] h-full  flex items-start mt-6  gap-7",children:[e("div",{children:e("img",{src:(y=n==null?void 0:n.products[0].product)==null?void 0:y.images[0],className:"size-[150px]   object-cover rounded-lg",alt:"image"})}),t("div",{children:[e("div",{children:`${(S=(j=n==null?void 0:n.products[0].product)==null?void 0:j.location)==null?void 0:S.address}, ${(M=(H=n==null?void 0:n.products[0].product)==null?void 0:H.location)==null?void 0:M.city}, ${(E=(D=n==null?void 0:n.products[0].product)==null?void 0:D.location)==null?void 0:E.state}, ${(z=(B=n==null?void 0:n.products[0].product)==null?void 0:B.location)==null?void 0:z.zipCode}, ${(w=(U=n==null?void 0:n.products[0].product)==null?void 0:U.location)==null?void 0:w.country}`}),t("div",{children:[e("p",{className:" font-semibold ",children:"Spot discription"}),e("p",{children:(G=n==null?void 0:n.products[0].product)==null?void 0:G.description})]})]})]}),c==h&&t("div",{className:"fixed top-[30%] left-[40%] rounded-2xl px-5 border border-black shadow-2xl overflow-auto bg-white h-[450px] w-fit",children:[e("button",{onClick:()=>Z(null),className:"absolute left-[90%] top-4",children:e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24",fill:"currentColor",children:e("path",{d:"M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"})})}),e(ie,{spot_id:n.products[0].product._id,owner_id:n.products[0].owner._id,showreview:!1})]}),e("div",{className:"w-[25%] h-full  py-3 flex flex-col gap-2  items-center justify-center",children:e("button",{onClick:()=>{_(n.products[0].owner._id),O(n.products[0].product._id),Z(c)},className:"w-full rounded-full h-7 border-2  border-black text-sm px-2 text-black font-semibold",children:"How was your Experience?"})})]})]},c)}),((k=s.data)==null?void 0:k.filter(n=>new Date(n.createdAt)<new Date).length)===0&&e("div",{className:"w-full flex justify-center items-center",children:e("p",{className:"text-lg font-semibold text-gray-500",children:"No PastBooking Bookings"})})]})})},ae=({data:s,sethostdeatils:a})=>t("div",{className:"flex items-center border rounded-lg p-4 px-9 shadow-lg max-w-sm relative bg-white",children:[e("div",{className:"w-16 h-16 bg-gray-300 rounded-full"}),t("div",{className:"ml-4",children:[t("p",{className:"text-lg font-semibold",children:["Host Name: ",s.name]}),t("p",{className:"text-md text-gray-600",children:["Email: ",s.email]})]}),e("button",{className:"absolute top-2 right-2   rounded-full w-6 h-6 flex items-center justify-center",onClick:()=>a(!1),children:e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24",fill:"currentColor",children:e("path",{d:"M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"})})})]});function ve(){return e(ne,{title:"Booking",children:e(le,{navs:[{name:"Upcoming Booking",view:"upcoming-booking",component:()=>e(ce,{})},{name:"Past Booking",view:"past-booking",component:()=>e(de,{})}]})})}export{ve as default};