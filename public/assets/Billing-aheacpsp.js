import{r as u,n,l as r,S as i,ad as s,Q as m,ac as l}from"./index-7VV-N64s.js";import{u as z}from"./useBillingInfo-DpYJFBc8.js";import{u as L}from"./useCityAndStates-BqyloICP.js";function Q(){var f,b,N,g,v,x,k,y,A,B;const{data:d,isLoading:h,updateBillingInfo:S}=z(),[a,t]=u.useState(d),M=((f=a.address)==null?void 0:f.state)||((b=d.address)==null?void 0:b.state)||"Connecticut",{cities:o,states:E}=L({state:M});u.useEffect(()=>{d&&t(d)},[d]),console.log();const I=e=>{e==null||e.focus(),e==null||e.scrollIntoView(),m.error("Bank account number and confirm bank account number do not match")},p=a.bankAccountNumber!=a.confirmBankAccountNumber,w=e=>{if(console.log(e.target),p){const c=e.target.confirmBankAccountNumber;return I(c),!1}return!0},F=async e=>{e.preventDefault(),w(e)&&(delete a.confirmBankAccountNumber,S(a,{onSuccess:()=>{t(c=>({...c,confirmBankAccountNumber:c.bankAccountNumber})),m.success("Billing information updated successfully")},onError:c=>{var C,q;m.error(((q=(C=c.response)==null?void 0:C.data)==null?void 0:q.message)||"Error updating billing information")}}))};return u.useEffect(()=>{h||t(e=>({...e,confirmBankAccountNumber:e.bankAccountNumber}))},[h,t]),n("form",{onSubmit:F,children:[n("div",{className:"flex flex-col gap-5 max-w-xl mt-9",children:[n("div",{className:"flex flex-col gap-1",children:[r("label",{htmlFor:"billing",className:"text-sm font-medium text-gray-600",children:"Payments Information"}),r("p",{className:"text-sm text-gray-600",children:"All payments will be made to this account"})]}),n("div",{className:"flex flex-col gap-2",children:[r(l,{required:!0,htmlFor:"first-name",children:"First Name"}),n("div",{className:"grid sm:grid-cols-5 gap-2",children:[r("div",{className:"col-span-1",children:n(i,{value:(N=a==null?void 0:a.address)==null?void 0:N.salutation,onChange:e=>t({...a,address:{...a.address,salutation:e.target.value}}),id:"salutation",required:!0,children:[r("option",{value:"",children:"Salutation"}),r("option",{value:"Mr",children:"Mr"}),r("option",{value:"Mrs",children:"Mrs"}),r("option",{value:"Miss",children:"Miss"})]})}),r("div",{className:"sm:col-span-2",children:r(s,{value:(g=a==null?void 0:a.address)==null?void 0:g.firstName,onChange:e=>t({...a,address:{...a.address,firstName:e.target.value}}),name:"firstName",type:"text",id:"first-name",placeholder:"First Name",required:!0})}),r("div",{className:"sm:col-span-2",children:r(s,{value:(v=a==null?void 0:a.address)==null?void 0:v.lastName,onChange:e=>t({...a,address:{...a.address,lastName:e.target.value}}),name:"lastName",type:"text",id:"last-name",placeholder:"Last Name"})})]})]}),n("div",{className:"flex flex-col gap-2 relative",children:[r(l,{required:!0,children:"Account Number"}),r(s,{type:"text",id:"bank-account-number",placeholder:"Account Number",required:!0,value:a==null?void 0:a.bankAccountNumber,onChange:e=>t({...a,bankAccountNumber:e.target.value})}),n("p",{className:"text-sm text-gray-600 -bottom-3 absolute",children:[r("span",{className:"text-red-600",children:"*"})," Your bank account must be a checking account."]})]}),n("div",{className:"flex flex-col gap-2",children:[r(l,{required:!0,children:"Confirm Account Number"}),r(s,{type:"text",id:"confirm-bank-account-number",placeholder:"Confirm Account Number",value:a.confirmBankAccountNumber,name:"confirmBankAccountNumber",required:!0,onChange:e=>t({...a,confirmBankAccountNumber:e.target.value})}),p?r("p",{className:"-mt-4 text-red-600 ",children:"Bank account number and confirm bank account number do not match."}):r("p",{className:"-mt-4 h-6"})]}),n("div",{className:"flex flex-col gap-2",children:[r(l,{required:!0,children:"Name of the bank"}),r(s,{type:"text",id:"bank-name",placeholder:"Name of the bank",required:!0,value:a.bankName,onChange:e=>t({...a,bankName:e.target.value})})]}),n("div",{className:"flex flex-col gap-2",children:[r(l,{required:!0,children:"Billing Address"}),r(s,{type:"text",id:"address",placeholder:"Address",required:!0,value:(x=a.address)==null?void 0:x.address,onChange:e=>t({...a,address:{...a.address,address:e.target.value}})}),r(s,{type:"text",id:"zip",placeholder:"Zip",required:!0,value:(k=a.address)==null?void 0:k.zip,onChange:e=>t({...a,address:{...a.address,zip:e.target.value}})}),n(i,{id:"city",required:!0,value:(y=a.address)==null?void 0:y.city,onChange:e=>t({...a,address:{...a.address,city:e.target.value}}),children:[r("option",{value:"",children:"Select City"}),o==null?void 0:o.map(e=>r("option",{value:e,children:e},e))]}),n(i,{id:"state",required:!0,value:(A=a.address)==null?void 0:A.state,onChange:e=>t({...a,address:{...a.address,state:e.target.value,city:""}}),children:[r("option",{value:"",children:"Select State"}),E.map(e=>r("option",{value:e,children:e},e))]}),r(s,{type:"text",id:"country",placeholder:"Country",required:!0,value:((B=a.address)==null?void 0:B.country)??"United States of America",onChange:e=>t({...a,address:{...a.address,country:e.target.value}})})]})]}),r("div",{className:"py-3 pl-7 w-[104%] bg-gray-200 backdrop-blur-sm -translate-x-5 translate-y-5 bottom-0",children:n("div",{className:"gap-2 flex",children:[r("button",{type:"submit",className:"bg-brand-primary text-black px-6 py-2 rounded-md font-semibold",children:"Save"}),r("button",{type:"reset",className:" text-black px-6 py-2 rounded-md font-semibold border border-gray-400",children:"Cancel"})]})})]})}export{Q as default};