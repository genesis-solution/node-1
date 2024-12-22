import{bu as P,bv as A,bw as T,bx as H,r as a,by as B,Z as D,bz as X,bA as E,bB as O,bi as G,bj as I,bn as V,k as R,l,n as M,ac as _,ad as F}from"./index-CYYMkemY.js";import{D as q}from"./DialogFullscreen-x-GnnSsf.js";function K(n,t,e){var i=e||{},o=i.noTrailing,r=o===void 0?!1:o,c=i.noLeading,u=c===void 0?!1:c,b=i.debounceMode,m=b===void 0?void 0:b,s,f=!1,h=0;function S(){s&&clearTimeout(s)}function N(v){var y=v||{},d=y.upcomingOnly,C=d===void 0?!1:d;S(),f=!C}function w(){for(var v=arguments.length,y=new Array(v),d=0;d<v;d++)y[d]=arguments[d];var C=this,z=Date.now()-h;if(f)return;function p(){h=Date.now(),t.apply(C,y)}function $(){s=void 0}!u&&m&&!s&&p(),S(),m===void 0&&z>n?u?(h=Date.now(),r||(s=setTimeout(m?$:p,n))):p():r!==!0&&(s=setTimeout(m?$:p,m===void 0?n-z:n))}return w.cancel=N,w}function Z(n,t,e){var i={},o=i.atBegin,r=o===void 0?!1:o;return K(n,t,{debounceMode:r!==!1})}const Q=new T("antSpinMove",{to:{opacity:1}}),W=new T("antRotate",{to:{transform:"rotate(405deg)"}}),J=n=>({[`${n.componentCls}`]:Object.assign(Object.assign({},H(n)),{position:"absolute",display:"none",color:n.colorPrimary,textAlign:"center",verticalAlign:"middle",opacity:0,transition:`transform ${n.motionDurationSlow} ${n.motionEaseInOutCirc}`,"&-spinning":{position:"static",display:"inline-block",opacity:1},"&-nested-loading":{position:"relative",[`> div > ${n.componentCls}`]:{position:"absolute",top:0,insetInlineStart:0,zIndex:4,display:"block",width:"100%",height:"100%",maxHeight:n.contentHeight,[`${n.componentCls}-dot`]:{position:"absolute",top:"50%",insetInlineStart:"50%",margin:-n.spinDotSize/2},[`${n.componentCls}-text`]:{position:"absolute",top:"50%",width:"100%",paddingTop:(n.spinDotSize-n.fontSize)/2+2,textShadow:`0 1px 2px ${n.colorBgContainer}`},[`&${n.componentCls}-show-text ${n.componentCls}-dot`]:{marginTop:-(n.spinDotSize/2)-10},"&-sm":{[`${n.componentCls}-dot`]:{margin:-n.spinDotSizeSM/2},[`${n.componentCls}-text`]:{paddingTop:(n.spinDotSizeSM-n.fontSize)/2+2},[`&${n.componentCls}-show-text ${n.componentCls}-dot`]:{marginTop:-(n.spinDotSizeSM/2)-10}},"&-lg":{[`${n.componentCls}-dot`]:{margin:-(n.spinDotSizeLG/2)},[`${n.componentCls}-text`]:{paddingTop:(n.spinDotSizeLG-n.fontSize)/2+2},[`&${n.componentCls}-show-text ${n.componentCls}-dot`]:{marginTop:-(n.spinDotSizeLG/2)-10}}},[`${n.componentCls}-container`]:{position:"relative",transition:`opacity ${n.motionDurationSlow}`,"&::after":{position:"absolute",top:0,insetInlineEnd:0,bottom:0,insetInlineStart:0,zIndex:10,width:"100%",height:"100%",background:n.colorBgContainer,opacity:0,transition:`all ${n.motionDurationSlow}`,content:'""',pointerEvents:"none"}},[`${n.componentCls}-blur`]:{clear:"both",opacity:.5,userSelect:"none",pointerEvents:"none","&::after":{opacity:.4,pointerEvents:"auto"}}},"&-tip":{color:n.spinDotDefault},[`${n.componentCls}-dot`]:{position:"relative",display:"inline-block",fontSize:n.spinDotSize,width:"1em",height:"1em","&-item":{position:"absolute",display:"block",width:(n.spinDotSize-n.marginXXS/2)/2,height:(n.spinDotSize-n.marginXXS/2)/2,backgroundColor:n.colorPrimary,borderRadius:"100%",transform:"scale(0.75)",transformOrigin:"50% 50%",opacity:.3,animationName:Q,animationDuration:"1s",animationIterationCount:"infinite",animationTimingFunction:"linear",animationDirection:"alternate","&:nth-child(1)":{top:0,insetInlineStart:0},"&:nth-child(2)":{top:0,insetInlineEnd:0,animationDelay:"0.4s"},"&:nth-child(3)":{insetInlineEnd:0,bottom:0,animationDelay:"0.8s"},"&:nth-child(4)":{bottom:0,insetInlineStart:0,animationDelay:"1.2s"}},"&-spin":{transform:"rotate(45deg)",animationName:W,animationDuration:"1.2s",animationIterationCount:"infinite",animationTimingFunction:"linear"}},[`&-sm ${n.componentCls}-dot`]:{fontSize:n.spinDotSizeSM,i:{width:(n.spinDotSizeSM-n.marginXXS/2)/2,height:(n.spinDotSizeSM-n.marginXXS/2)/2}},[`&-lg ${n.componentCls}-dot`]:{fontSize:n.spinDotSizeLG,i:{width:(n.spinDotSizeLG-n.marginXXS)/2,height:(n.spinDotSizeLG-n.marginXXS)/2}},[`&${n.componentCls}-show-text ${n.componentCls}-text`]:{display:"block"}})}),U=P("Spin",n=>{const t=A(n,{spinDotDefault:n.colorTextDescription,spinDotSize:n.controlHeightLG/2,spinDotSizeSM:n.controlHeightLG*.35,spinDotSizeLG:n.controlHeight});return[J(t)]},{contentHeight:400});var Y=function(n,t){var e={};for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&t.indexOf(i)<0&&(e[i]=n[i]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,i=Object.getOwnPropertySymbols(n);o<i.length;o++)t.indexOf(i[o])<0&&Object.prototype.propertyIsEnumerable.call(n,i[o])&&(e[i[o]]=n[i[o]]);return e};let x=null;function k(n,t){const{indicator:e}=t,i=`${n}-dot`;return e===null?null:E(e)?O(e,{className:D(e.props.className,i)}):E(x)?O(x,{className:D(x.props.className,i)}):a.createElement("span",{className:D(i,`${n}-dot-spin`)},a.createElement("i",{className:`${n}-dot-item`}),a.createElement("i",{className:`${n}-dot-item`}),a.createElement("i",{className:`${n}-dot-item`}),a.createElement("i",{className:`${n}-dot-item`}))}function nn(n,t){return!!n&&!!t&&!isNaN(Number(t))}const en=n=>{const{spinPrefixCls:t,spinning:e=!0,delay:i=0,className:o,rootClassName:r,size:c="default",tip:u,wrapperClassName:b,style:m,children:s,hashId:f}=n,h=Y(n,["spinPrefixCls","spinning","delay","className","rootClassName","size","tip","wrapperClassName","style","children","hashId"]),[S,N]=a.useState(()=>e&&!nn(e,i));a.useEffect(()=>{if(e){const p=Z(i,()=>{N(!0)});return p(),()=>{var $;($=p==null?void 0:p.cancel)===null||$===void 0||$.call(p)}}N(!1)},[i,e]);const w=a.useMemo(()=>typeof s<"u",[s]),{direction:v}=a.useContext(B),y=D(t,{[`${t}-sm`]:c==="small",[`${t}-lg`]:c==="large",[`${t}-spinning`]:S,[`${t}-show-text`]:!!u,[`${t}-rtl`]:v==="rtl"},o,r,f),d=D(`${t}-container`,{[`${t}-blur`]:S}),C=X(h,["indicator","prefixCls"]),z=a.createElement("div",Object.assign({},C,{style:m,className:y,"aria-live":"polite","aria-busy":S}),k(t,n),u?a.createElement("div",{className:`${t}-text`},u):null);return w?a.createElement("div",Object.assign({},C,{className:D(`${t}-nested-loading`,b,f)}),S&&a.createElement("div",{key:"loading"},z),a.createElement("div",{className:d,key:"container"},s)):z},L=n=>{const{prefixCls:t}=n,{getPrefixCls:e}=a.useContext(B),i=e("spin",t),[o,r]=U(i),c=Object.assign(Object.assign({},n),{spinPrefixCls:i,hashId:r});return o(a.createElement(en,Object.assign({},c)))};L.setDefaultIndicator=n=>{x=n};var tn={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M894 462c30.9 0 43.8-39.7 18.7-58L530.8 126.2a31.81 31.81 0 00-37.6 0L111.3 404c-25.1 18.2-12.2 58 18.8 58H192v374h-72c-4.4 0-8 3.6-8 8v52c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-52c0-4.4-3.6-8-8-8h-72V462h62zM512 196.7l271.1 197.2H240.9L512 196.7zM264 462h117v374H264V462zm189 0h117v374H453V462zm307 374H642V462h118v374z"}}]},name:"bank",theme:"outlined"},j=function(t,e){return a.createElement(G,I(I({},t),{},{ref:e,icon:tn}))};j.displayName="BankOutlined";const ln=a.forwardRef(j);function on({user:n,enabled:t}){return V({queryKey:["bankAccount",n],queryFn:async(e,i)=>{n&&(e.user=n);const o=await R.get("/bankAccount/all",{params:e,signal:i});return{data:o.data.data,total:o.data.total}},enabled:t})}function g({label:n,value:t}){const e=`Copy ${n}`;return M("div",{onClick:()=>navigator.clipboard.writeText(t),title:e,className:"cursor-not-allowed",children:[l(_,{children:n}),l(F,{disabled:!0,value:t})]})}function rn(n){var o,r,c,u,b,m,s,f;const t=on({user:n.user,enabled:n.open}),e=(o=t.data)==null?void 0:o[0],i=(e==null?void 0:e.nameOnAccount)??[(r=e==null?void 0:e.address)==null?void 0:r.salutation,e==null?void 0:e.address.firstName,(c=e==null?void 0:e.address)==null?void 0:c.lastName].filter(Boolean).join(" ");return l(q,{open:n.open,onClose:n.onClose,title:"View Bank Account",children:t.query.isFetching?l(L,{className:"mx-auto my-auto",fullscreen:!0}):M("form",{onSubmit:h=>h.preventDefault(),className:"p-5 grid sm:grid-cols-2 gap-3",children:[l(g,{label:"Name on Account",value:i}),l(g,{label:"Bank Account Number",value:e==null?void 0:e.bankAccountNumber}),l(g,{label:"Bank Name",value:e==null?void 0:e.bankName}),l(g,{label:"Address",value:(u=e==null?void 0:e.address)==null?void 0:u.address}),l(g,{label:"ZIP Code",value:(b=e==null?void 0:e.address)==null?void 0:b.zip}),l(g,{label:"City",value:(m=e==null?void 0:e.address)==null?void 0:m.city}),l(g,{label:"State",value:(s=e==null?void 0:e.address)==null?void 0:s.state}),l(g,{label:"Country",value:(f=e==null?void 0:e.address)==null?void 0:f.country})]})})}export{ln as B,rn as V,on as u};
