import{r as c,x as N,n as o,l as e,q as C,L as y,F as k,D as S,z as D}from"./index-7VV-N64s.js";import{u as F}from"./useCategories-CVIE_Zfq.js";import{u as L}from"./useCityAndStates-BqyloICP.js";import{S as I}from"./Slide-Czci6Jo-.js";function E({cities:i}){const[b,d]=c.useState(!1),[m,f]=N(),[p,x]=c.useState(i),[l,s]=c.useState(""),[h,u]=c.useState(""),g=r=>{const a=[...r];for(let t=0;t<a.length-1;t++)for(let n=0;n<a.length-t-1;n++)a[n].localeCompare(a[n+1])>0&&([a[n],a[n+1]]=[a[n+1],a[n]]);return a};return o("div",{className:"md:w-full px-3 bg-transparent rounded-2xl p-2 w-full ",children:[e("label",{className:"text-black",htmlFor:"city",children:"City"}),b?e("div",{children:e("input",{type:"text",className:"bg-transparent block  border-none h-fit py-2 px-0 text-black text-sm font-main outline-none focus:ring-0 w-[200px]",placeholder:"Search city ",value:l,onChange:r=>{const a=r.target.value.toLowerCase();if(s(a),a==="")x(i);else{const t=i.filter(n=>n.toLowerCase().includes(a));x(g(t))}}})}):e("button",{className:"appearance-none bg-transparent block w-[200px] text-start border-none h-fit py-2 px-0 text-black text-sm font-main outline-none",onClick:()=>d(!0),children:h||"Select City"}),b&&e("div",{className:"max-h-[70vh] h-fit absolute overflow-auto border rounded-lg mt-2 w-[200px] ",children:e("ul",{className:"bg-white text-black  overflow-hidden",children:p.length>0?p.map((r,a)=>e("li",{className:"py-1 px-2 hover:bg-brand-primary hover:text-black duration-200 cursor-pointer",onClick:()=>{m.set("location.city",r),f(m),d(!1),u(r),s("")},children:r},a)):i.map((r,a)=>e("li",{className:"py-1 px-2  duration-200 cursor-pointer",onClick:()=>{m.set("location.city",r),f(m),d(!1),u(r),s("")},children:r},a))})})]})}function P({categories:i}){const[b,d]=c.useState(!1),[m,f]=N(),[p,x]=c.useState(""),[l,s]=c.useState(i),[h,u]=c.useState(""),g=r=>{const a=[...r];for(let t=0;t<a.length-1;t++)for(let n=0;n<a.length-t-1;n++)a[n].localeCompare(a[n+1])>0&&([a[n],a[n+1]]=[a[n+1],a[n]]);return a};return o("div",{className:"md:w-full px-3 bg-transparent rounded-2xl p-2 w-full ",children:[e("label",{className:"text-black",htmlFor:"Category",children:"Category"}),b?e("div",{children:e("input",{type:"text",className:"bg-transparent block  border-none h-fit py-2 px-0 text-black text-sm font-main outline-none focus:ring-0 w-[200px]",placeholder:"Search Category",value:h,onChange:r=>{const a=r.target.value.toLowerCase();if(u(a),a==="")s(i);else{const t=i.filter(n=>n.toLowerCase().includes(a));s(g(t))}}})}):e("button",{className:"appearance-none bg-transparent block w-[200px] text-start border-none h-fit py-2 px-0 text-black text-sm font-main outline-none",onClick:()=>d(!0),children:p||"Select Category"}),b&&e("div",{className:"max-h-[70vh] h-fit absolute overflow-auto border rounded-lg mt-2 w-[200px] ",children:e("ul",{className:"bg-white text-black  overflow-hidden",children:l.length>0?l.map((r,a)=>e("li",{className:"py-1 px-2 hover:bg-brand-primary hover:text-black duration-200 cursor-pointer",onClick:()=>{m.set("location.Category",r),f(m),d(!1),x(r),u("")},children:r},a)):i.map((r,a)=>e("li",{className:"py-1 px-2  duration-200 cursor-pointer",onClick:()=>{m.set("location.Category",r),f(m),x(r),d(!1),u("")},children:r},a))})})]})}const T=c.forwardRef(function(b,d){return e(I,{direction:"up",ref:d,...b})});function M(){return e(k,{children:o("div",{className:"mx-auto flex flex-col justify-evenly ml-10  w-full  items-center z-10  my-auto h-full",children:[e("div",{className:"hidden sm:block  -ml-28"}),o("h1",{className:"text-xl  md:text-2xl lg:text-5xl font-[500] text-white font-main  text-center w-[100%]  lg:mt-10 sm:mt-0  mx-auto sm:block",children:["Tired of searching? Find the ",e("br",{})," perfect spot for your occasion"]}),e(_,{})]})})}function _(){const[i,b]=c.useState(!1),d=()=>{b(!i)};i?document.body.classList.add("active-modal"):document.body.classList.remove("active-modal"),c.useState(!1);const[m,f]=c.useState(!1);var p=C();p=p.pathname;const x=()=>{f(!1)},[l,s]=N(),{categories:h}=F(),{cities:u}=L({state:"Connecticut"}),[g,v]=c.useState([]);c.useMemo(()=>{v(h.map(t=>t.name))},[h]),c.useEffect(()=>{l.set("date",new Date().toISOString().split("T")[0]),s(l)},[]);const[r,a]=c.useState(window.innerWidth);return window.addEventListener("resize",()=>{a(window.innerWidth),console.log(r)}),c.useEffect(()=>{console.log(r),window.removeEventListener("resize",()=>{console.log("removed event listener")})},[r]),o(k,{children:[i&&o("div",{className:"overlay backdrop-blur-3xl",children:[e("div",{onClick:d,className:"h-[24vh] bg-transparent"}),e("div",{className:"modal bg-white mt-40 z-[9999] pt-10 w-full animate-slideUp   h-fit rounded-t-2xl overflow-hidden ",children:o("div",{className:" bg-white text-black h-[85vh] w-screen  ",children:[o("div",{className:"flex flex-wrap  px-3 pt-3 gap-5 md:flex sm:flex-row items-center md:gap-2 w-full",children:[o("div",{className:"md:w-full px-3 bg-slate-100 rounded-2xl p-2 w-full ",children:[e("label",{className:"text-black",htmlFor:"city",children:"City"}),o("select",{className:"appearance-none bg-slate-100 block w-full border-none h-fit py-2 px-0 text-black text-sm font-main outline-none",onChange:t=>{l.set("location.city",t.target.value),s(l)},value:l.get("city"),children:[e("option",{value:"",disabled:!0,selected:!0,children:"Select City"}),u.map((t,n)=>e("option",{value:t,children:t},n))]})]}),e("div",{className:"border h-[50px] bg-slate-100 rounded-2xl p-4 border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4 bg-slate-100 rounded-2xl p-2",children:[e("label",{className:"text-black",htmlFor:"category",children:"Category"}),o("select",{className:"px-0 block w-full bg-slate-100 border-none h-fit py-2 text-black text-sm outline-none",placeholder:"Select",onChange:t=>{const n=h.find(w=>w._id==t.target.value);l.set("categories[]",n._id),s(l)},value:l.get("categories[]"),children:[e("option",{value:"",disabled:!0,selected:!0,children:"Select Category"}),h.map(t=>e("option",{value:t._id,children:t.name},t._id))]})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4 bg-slate-100 rounded-2xl p-2",children:[e("label",{className:"text-black",htmlFor:"date",children:"Check In"}),e("input",{type:"Date",className:"block w-full bg-slate-100 border-none h-fit py-2 rounded-2xl text-black text-sm px-0 font-main outline-none",placeholder:"Card holder",maxLength:"22",onChange:t=>{l.set("date",t.target.value),s(l)},value:l.get("date")})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4 bg-slate-100 rounded-2xl p-2",children:[e("label",{className:"text-black",htmlFor:"maxCapacity",children:"Guest"}),e("input",{type:"number",className:"block w-full bg-slate-100 border-none h-fit py-2 px-0 text-black text-sm font-main outline-none",placeholder:"Number of Guest",maxLength:"22",min:1,onChange:t=>{l.set("maxCapacity",t.target.value),s(l)},value:l.get("maxCapacity")})]})]}),e("div",{className:"px-3 flex justify-center pt-5",children:e(y,{to:`/spots${location.search}`,children:e("button",{onClick:d,className:"font-bold bg-brand-primary text-black p-4 rounded-lg",children:"Explore Spot"})})}),e("button",{className:"close-modal mt-5 ml-3 z-50",onClick:d})]})})]}),e("div",{children:r>600?o("div",{className:"group rounded-xl flex flex-col sm:flex-row shadow-c1 bg-white gap-1 items-center px-10 py-4 w-[90svw] xs:w-[60svw] sm:w-[90%] md:w-full overflow-auto",children:[o("div",{className:"flex   sm:flex-row  items-center md:gap-2 w-full",children:[e(E,{cities:u}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),e(P,{categories:g}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4",children:[e("label",{className:"text-black",htmlFor:"date",children:"Check In"}),e("input",{type:"Date",className:"block w-full border-none h-fit py-2 rounded-2xl  text-black text-sm px-0  font-main outline-none focus:ring-0",placeholder:"Card holder",maxLength:"22",onChange:t=>{l.set("date",t.target.value),s(l)},value:l.get("date"),style:{WebkitCalendarPickerIndicator:{filter:"invert(1)"}}})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4",children:[e("label",{className:"text-black",htmlFor:"maxCapacity",children:"Guests"}),e("input",{type:"number",className:"block w-full border-none h-fit py-2 px-0 text-black text-sm  font-main outline-none focus:ring-0 placeholder:text-black",placeholder:"Number of Guests",maxLength:"22",min:1,onChange:t=>{l.set("maxCapacity",t.target.value),s(l)},value:l.get("maxCapacity")})]})]}),e("div",{className:"px-3 y h-[80%] bg-brand-primary duration-200 text-black flex items-center rounded-[8px] group-hover:text-white group-hover:bg-black py-2",children:e(y,{to:`/spots${location.search}`,children:e("button",{className:"font-bold whitespace-nowrap bg-transparent  px-4 ",children:"Explore Spot"})})})]}):e("div",{children:p==="/spots"?e(k,{}):o("div",{className:`px-3 ${p==="/spots"?"-mt-28":""}  bg-brand-primary h-[80%] flex items-center rounded-[8px] py-2`,children:[e("button",{className:"font-bold whitespace-nowrap bg-brand-primary text-black px-4 ",onClick:d,children:"Explore Spot"}),e(S,{open:m,TransitionComponent:T,keepMounted:!0,onClose:x,"aria-describedby":"alert-dialog-slide-description",children:o(D,{className:"rounded-xl flex  flex-col sm:flex-row shadow-c1 bg-white gap-1 items-center px-10 py-4 overflow-auto",children:[o("div",{className:"flex flex-wrap  md:flex sm:flex-row  items-center md:gap-2 w-full",children:[o("div",{className:"md:w-full ",children:[e("label",{className:"text-black",htmlFor:"city",children:"City"}),o("select",{className:"appearance-none block w-full border-none h-fit py-2 px-0 text-black text-sm  font-main outline-none",onChange:t=>{l.set("location.city",t.target.value),s(l)},value:l.get("city"),children:[e("option",{value:"",disabled:!0,selected:!0,children:"Select City"}),u.map((t,n)=>e("option",{value:t,children:t},n))]})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4",children:[e("label",{className:"text-black",htmlFor:"category",children:"Category"}),o("select",{className:"px-0 block w-full border-none h-fit py-2   text-black text-sm  outline-none",placeholder:"Select",onChange:t=>{const n=h.find(w=>w._id==t.target.value);l.set("categories[]",n._id),s(l)},value:l.get("categories[]"),children:[e("option",{value:"",disabled:!0,selected:!0,children:"Select Category"}),h.map(t=>e("option",{value:t._id,children:t.name},t._id))]})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4",children:[e("label",{className:"text-black",htmlFor:"date",children:"Check In"}),e("input",{type:"Date",className:"block w-full border-none h-fit py-2 rounded-2xl  text-black text-sm px-0  font-main outline-none",placeholder:"Card holder",maxLength:"22",onChange:t=>{l.set("date",t.target.value),s(l)},value:l.get("date"),style:{WebkitCalendarPickerIndicator:{filter:"invert(1)"}}})]}),e("div",{className:"border h-[50px] border-[#D7D7D7] hidden sm:block"}),o("div",{className:"w-full sm:px-4",children:[e("label",{className:"text-black",htmlFor:"maxCapacity",children:"Guest"}),e("input",{type:"number",className:"block w-full border-none h-fit py-2 px-0 text-black text-sm  font-main outline-none",placeholder:"Number of Guest",maxLength:"22",min:1,onChange:t=>{l.set("maxCapacity",t.target.value),s(l)},value:l.get("maxCapacity")})]})]}),e("div",{className:"px-3 bg-brand-primary h-[80%] flex items-center rounded-[8px] py-2",children:e(y,{to:`/spots${location.search}`,children:e("button",{onClick:x,className:"font-bold whitespace-nowrap bg-brand-primary text-black px-4 ",children:"Explore Spot"})})})]})})]})})})]})}export{M as H,_ as S};