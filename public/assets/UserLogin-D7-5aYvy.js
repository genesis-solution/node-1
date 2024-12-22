import{r as i,b5 as F,q as _,a0 as C,n as m,l as e,L as P,k as O,Q as j}from"./index-7VV-N64s.js";import{P as U}from"./PasswordInput-C082zh4F.js";import{E as Q}from"./EmailInput-CDvAPGKm.js";import{S as R}from"./SubmitButton-A2513g0k.js";import{c as q}from"./codes-Ckrw1uAF.js";function M(){var u;const[o,D]=i.useState(""),[l,I]=i.useState(""),n=F(),[c,d]=i.useState(null),t=_(),{refresh:T}=C();async function B(s){var r,f,p,g,h,x,y,w,N,v,S,E,b,k,L,A;try{const a=await O.post("/auth/login",s);await T(),console.log(((f=(r=t.state)==null?void 0:r.from)==null?void 0:f.pathname)||((p=t.state)==null?void 0:p.from)||"/"),n(((h=(g=t.state)==null?void 0:g.from)==null?void 0:h.pathname)||((x=t.state)==null?void 0:x.from)||"/",{replace:!0,state:(w=(y=t.state)==null?void 0:y.from)==null?void 0:w.state}),console.log(a.data)}catch(a){if(((v=(N=a.response)==null?void 0:N.data)==null?void 0:v.code)===q.ACCOUNT_NOT_VERIFIED.code){j.warning("Account not verified. Please verify your email to login"),n("/auth/request-verfication-email",{state:{email:o,from:t}});return}if(((E=(S=a.response)==null?void 0:S.data)==null?void 0:E.code)===q["2FA_ENABLED"].code){n("/auth/request-2fa",{state:{email:o,password:s.password,from:t}});return}if(((k=(b=a.response)==null?void 0:b.data)==null?void 0:k.code)===429){j.error("Too many requests. Try again later");return}d(((A=(L=a.response)==null?void 0:L.data)==null?void 0:A.message)??"Something went wrong"),console.error(a)}}return m("main",{className:"text-black py-4",children:[e("p",{className:"text-xs text-gray-500 font-[400]",children:"Book your spot and enjoy the event you looking forward "}),m("form",{onSubmit:async s=>{s.preventDefault();let r={email:o,password:l};d(null),await B(r)},className:"my-6",children:[e("div",{className:"mb-3",children:e(Q,{email:o,setEmail:D})}),e(U,{password:l,handlePassword:s=>{I(s.target.value)}}),e("div",{className:"flex flex-row items-end mt-2 justify-end",children:e(P,{to:"forgot-password",className:"text-xs font-medium  underline text-gray-500 hover:text-gray-700 ",children:"Forgot password?"})}),c&&e("p",{className:"text-red-500  text-sm mt-2",children:c}),e(R,{text:"Log in"})]}),m(P,{to:"signup",className:"text-sm font-medium text-gray-500",state:{from:(u=t.state)==null?void 0:u.from},children:["Don't have an account? "," ",e("span",{className:"text-black ml-3 underline",children:"Sign up"})]})]})}export{M as default};
