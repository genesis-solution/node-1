import{l as t,Q as a,k as r}from"./index-7VV-N64s.js";import{R as o}from"./RequestWithEmail-C5ANbCEf.js";import"./EmailInput-CDvAPGKm.js";import"./SubmitButton-A2513g0k.js";import"./index-CsrS5TK7.js";function u(){async function i(e){await a.promise(r.post("/auth/request-verification",{email:e}),{loading:"Requesting Verification...",success:"Verification Email Sent",error:"Failed to send verification email"})}return t(o,{handler:i,text:"Get Verification Email",header:"Request Verification Email"})}export{u as default};
