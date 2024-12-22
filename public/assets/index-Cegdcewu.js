import{w as f,n as m,l as r,k as _,a5 as j,a0 as U,q as k,r as w,t as L,F as v,Q as T,a9 as E}from"./index-CYYMkemY.js";import{u as F,f as B}from"./socket-Ct7_Ier6.js";import{M as P}from"./MessageBox-DVdEd1Lw.js";import{A as R,a as C}from"./AvatarGroup-DkV5TBGl.js";import"./DialogContentText-DIlckXhd.js";function M({chat:n,onClick:e,selected:p}){var u,x,h;return m("div",{className:`flex flex-row py-4 px-2 justify-center  items-center  border-b-2 gap-3 ${p?"bg-slate-100":""}`,onClick:()=>{e(n._id),console.log(n._id)},children:[r("div",{className:"w-1/4",children:r(R,{max:1,spacing:"small",children:n.users.length?n.users.map(l=>r(C,{src:`${_.defaults.baseURL}/auth/user/image/${l.profilePic}`,children:r(j,{className:"text-5xl rounded-full border-2  p-1"},l._id)},l._id)):r(C,{children:r(j,{className:"text-5xl rounded-full border-2  p-1"})})})}),r("div",{className:"w-full",children:r("div",{className:"text-lg font-semibold hidden sm:block",children:(u=n.broadcast)!=null&&u.length?(x=n.broadcast)==null?void 0:x.join(", "):(h=n==null?void 0:n.users)==null?void 0:h.map(l=>r("span",{className:"block text-sm",children:l.name},l._id))})})]},`chat-user-manager-${n._id}`)}M.propTypes={chat:f.object,onClick:f.func,selected:f.bool};function S({chat:n,message:e}){var d,b,s,N;const p=new Date(e==null?void 0:e.createdAt),u=p.getTime()?p.toLocaleTimeString():"now",x=`${_.defaults.baseURL}/chat/file/${e.file}`,{auth:h}=U(),l=(e==null?void 0:e.user._id)??(e==null?void 0:e.user)===h._id;return m("div",{className:`flex items-end mb-4 gap-x-2 ${l?"self-end flex-row":"self-start flex-row-reverse"}`,children:[m("div",{className:`min-w-40 py-3 px-4 text-white ${l?"bg-blue-400 rounded-bl-xl rounded-tl-xl rounded-tr-xl":"bg-gray-400 rounded-br-xl rounded-tr-xl rounded-tl-xl"} flex flex-col`,children:[n.type==="private"&&m("p",{className:"text-xs",children:[(d=e==null?void 0:e.user)==null?void 0:d.name," (",(b=e==null?void 0:e.user)==null?void 0:b.id,")"]}),r("p",{className:"text-sm",children:e==null?void 0:e.message}),(e==null?void 0:e.type)==="image"&&(e==null?void 0:e.file)&&r("img",{src:x,className:"object-cover",alt:""}),(e==null?void 0:e.type)==="file"&&(e==null?void 0:e.file)&&r("a",{href:x,target:"_blank",rel:"noreferrer",className:"text-xs hover:underline",children:"Download"}),r("i",{className:"text-[.7rem] -mb-3 self-end",children:u})]}),(s=e==null?void 0:e.user)!=null&&s.profilePic?r("img",{src:`${_.defaults.baseURL}/auth/user/image/${(N=e==null?void 0:e.user)==null?void 0:N.profilePic}`,className:"object-cover h-8 w-8 rounded-full",alt:""}):r(j,{className:"text-5xl rounded-full border-2 text-gray-500 p-1 border-gray-500 w-8 h-8"})]})}S.propTypes={message:f.object,isSender:f.bool,chat:f.object};function A({chat:n,setChat:e,chats:p,disabledMessageBox:u,handleSubmit:x}){var h,l;return m("div",{className:"relative overflow-auto min-h-[80vh] max-h-[80vh] flex flex-col mx-auto  rounded-lg md:w-full",children:[m("div",{className:"flex flex-row justify-between bg-white max-h-[80vh]",children:[r("div",{className:"flex flex-col w-2/5 border-r-2 overflow-y-auto",children:Object.entries(p).map(([d,b])=>r(M,{selected:n===d,chat:b,onClick:e},d))}),r("div",{className:"md:w-full px-2 flex flex-col justify-between max-h-[70vh] min-h-[70vh]",children:r("div",{className:"flex flex-col mt-5 max-h-full overflow-y-auto pb-28 px-3",children:p&&((l=(h=p[n])==null?void 0:h.messages)==null?void 0:l.map((d,b)=>r(S,{message:d,chat:p[n]},`chat-message-${d._id??b}`)))})})]}),!u&&r(P,{disabled:u||!n,enableFile:!0,onSend:({message:d,file:b})=>x({chat:n,message:d,file:b})})]})}A.propTypes={children:f.node,chats:f.object,disabledMessageBox:f.bool,handleSubmit:f.func,setChat:f.func,chat:f.object};function H(){const n=k();w.useEffect(()=>{var t,o;const c=(t=n.state)==null?void 0:t.chat,i=(o=n.state)==null?void 0:o.name;c&&(d("system"),u(a=>(a.system[c]={_id:c,users:[{name:i}],type:"system",messages:[],broadcast:[]},{...a})),h(c))},[n.state]);const e={private:{},system:{},broadcast:{host:{_id:"host",users:[{name:"Host"}],broadcast:["host"],type:"broadcast",messages:[]},user:{_id:"user",users:[{name:"User"}],type:"broadcast",broadcast:["user"],messages:[]}}},[p,u]=w.useState(e),[x,h]=w.useState(),[l,d]=w.useState("broadcast"),{auth:b}=U(),s=F();L({queryKey:["chats",b._id],queryFn:async({signal:c})=>{const{data:i}=await _.get("/chat",{signal:c}),t=e;for(let o=0;o<i.length;o++){const a=i[o];if(a.type==="broadcast"){const y=a.broadcast.includes("host")?"host":"user";t[a.type][y]={...a,_id:y}}else t[a.type][a._id]=a}return u(t),i}}),w.useEffect(()=>(s.disconnect(),s.connect().emit("connection"),()=>{s.disconnect()}),[s]),w.useEffect(()=>{console.log("socket",s);function c(t){console.log("onNewMessage",t),h(o=>t.chat.replace&&t.chat.replace===o?t.chat._id:o),u(o=>{const a=o[t.chat.type][t.chat.replace];t.chat.replace&&delete o[t.chat.type][t.chat.replace];const y=o[t.chat.type][t.chat._id];return y?(console.log("length",y.messages.length,t),y.messages.push(t),{...o}):(console.log("new chat",t),o[t.chat.type][t.chat._id]={_id:t.chat._id,broadcast:[],users:a?[{name:a==null?void 0:a.users[0].name}]:[],type:t.chat.type,messages:[t]},{...o})})}function i({chat:t}){console.log("onUpdateNewChat",t),u(o=>(delete o[t.type][t.replace],o[t.type][t._id]=t,{...o}))}return s.removeAllListeners("UpdateNewMessage"),s.removeAllListeners("UpdateNewChat"),s.on("UpdateNewMessage",c),s.on("UpdateNewChat",i),()=>{s.removeAllListeners("UpdateNewMessage"),s.removeAllListeners("UpdateNewChat")}},[s]);const N=async({message:c,chat:i,file:t})=>{if(!$(c)||!i)return;const o={chat:i,message:c,file:t?{buffer:t,filename:t==null?void 0:t.name,type:"image"}:{}};console.log(o),l==="system"&&s.emit("sendSystemMessage",o),l==="broadcast"&&s.emit("sendBroadcastMessage",o)},$=c=>new RegExp(B.join("|"),"gi").test(c)?(T.error("Message contains inappropriate words!"),!1):!0;return m(v,{children:[r(E,{onTabChange:c=>{var i;(i=n.state)!=null&&i.chat||h(null),d(c)},active:l,withState:!0,navs:[{name:"Broadcast",view:"broadcast",component:()=>r(v,{})},{name:"Admin",view:"system",component:()=>r(v,{})},{name:"Users",view:"private",component:()=>r(v,{})}]}),r(A,{chat:x,setChat:h,chats:p[l]??{},disabledMessageBox:l==="private",handleSubmit:N})]})}export{H as default};