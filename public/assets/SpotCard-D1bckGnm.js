import{bd as V,j as G,b5 as H,r as J,l as i,n as s,k as K,F as R,w as j}from"./index-7VV-N64s.js";import{g as O,S as Q,a as W}from"./swiper-DPGn5qAn.js";const X=V(G.jsx("path",{d:"M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"}),"Star");function Y(E){let{swiper:e,extendParams:N,on:l,emit:a,params:c}=E;e.autoplay={running:!1,paused:!1,timeLeft:0},N({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!1,stopOnLastSlide:!1,reverseDirection:!1,pauseOnMouseEnter:!1}});let u,y,g=c&&c.autoplay?c.autoplay.delay:3e3,m=c&&c.autoplay?c.autoplay.delay:3e3,r,o=new Date().getTime(),x,T,v,M,L,p,D;function I(t){!e||e.destroyed||!e.wrapperEl||t.target===e.wrapperEl&&(e.wrapperEl.removeEventListener("transitionend",I),!D&&f())}const P=()=>{if(e.destroyed||!e.autoplay.running)return;e.autoplay.paused?x=!0:x&&(m=r,x=!1);const t=e.autoplay.paused?r:o+m-new Date().getTime();e.autoplay.timeLeft=t,a("autoplayTimeLeft",t,t/g),y=requestAnimationFrame(()=>{P()})},_=()=>{let t;return e.virtual&&e.params.virtual.enabled?t=e.slides.filter(n=>n.classList.contains("swiper-slide-active"))[0]:t=e.slides[e.activeIndex],t?parseInt(t.getAttribute("data-swiper-autoplay"),10):void 0},S=t=>{if(e.destroyed||!e.autoplay.running)return;cancelAnimationFrame(y),P();let d=typeof t>"u"?e.params.autoplay.delay:t;g=e.params.autoplay.delay,m=e.params.autoplay.delay;const n=_();!Number.isNaN(n)&&n>0&&typeof t>"u"&&(d=n,g=n,m=n),r=d;const b=e.params.speed,$=()=>{!e||e.destroyed||(e.params.autoplay.reverseDirection?!e.isBeginning||e.params.loop||e.params.rewind?(e.slidePrev(b,!0,!0),a("autoplay")):e.params.autoplay.stopOnLastSlide||(e.slideTo(e.slides.length-1,b,!0,!0),a("autoplay")):!e.isEnd||e.params.loop||e.params.rewind?(e.slideNext(b,!0,!0),a("autoplay")):e.params.autoplay.stopOnLastSlide||(e.slideTo(0,b,!0,!0),a("autoplay")),e.params.cssMode&&(o=new Date().getTime(),requestAnimationFrame(()=>{S()})))};return d>0?(clearTimeout(u),u=setTimeout(()=>{$()},d)):requestAnimationFrame(()=>{$()}),d},C=()=>{o=new Date().getTime(),e.autoplay.running=!0,S(),a("autoplayStart")},h=()=>{e.autoplay.running=!1,clearTimeout(u),cancelAnimationFrame(y),a("autoplayStop")},w=(t,d)=>{if(e.destroyed||!e.autoplay.running)return;clearTimeout(u),t||(p=!0);const n=()=>{a("autoplayPause"),e.params.autoplay.waitForTransition?e.wrapperEl.addEventListener("transitionend",I):f()};if(e.autoplay.paused=!0,d){L&&(r=e.params.autoplay.delay),L=!1,n();return}r=(r||e.params.autoplay.delay)-(new Date().getTime()-o),!(e.isEnd&&r<0&&!e.params.loop)&&(r<0&&(r=0),n())},f=()=>{e.isEnd&&r<0&&!e.params.loop||e.destroyed||!e.autoplay.running||(o=new Date().getTime(),p?(p=!1,S(r)):S(),e.autoplay.paused=!1,a("autoplayResume"))},F=()=>{if(e.destroyed||!e.autoplay.running)return;const t=O();t.visibilityState==="hidden"&&(p=!0,w(!0)),t.visibilityState==="visible"&&f()},k=t=>{t.pointerType==="mouse"&&(p=!0,D=!0,!(e.animating||e.autoplay.paused)&&w(!0))},A=t=>{t.pointerType==="mouse"&&(D=!1,e.autoplay.paused&&f())},q=()=>{e.params.autoplay.pauseOnMouseEnter&&(e.el.addEventListener("pointerenter",k),e.el.addEventListener("pointerleave",A))},B=()=>{e.el.removeEventListener("pointerenter",k),e.el.removeEventListener("pointerleave",A)},z=()=>{O().addEventListener("visibilitychange",F)},U=()=>{O().removeEventListener("visibilitychange",F)};l("init",()=>{e.params.autoplay.enabled&&(q(),z(),C())}),l("destroy",()=>{B(),U(),e.autoplay.running&&h()}),l("_freeModeStaticRelease",()=>{(v||p)&&f()}),l("_freeModeNoMomentumRelease",()=>{e.params.autoplay.disableOnInteraction?h():w(!0,!0)}),l("beforeTransitionStart",(t,d,n)=>{e.destroyed||!e.autoplay.running||(n||!e.params.autoplay.disableOnInteraction?w(!0,!0):h())}),l("sliderFirstMove",()=>{if(!(e.destroyed||!e.autoplay.running)){if(e.params.autoplay.disableOnInteraction){h();return}T=!0,v=!1,p=!1,M=setTimeout(()=>{p=!0,v=!0,w(!0)},200)}}),l("touchEnd",()=>{if(!(e.destroyed||!e.autoplay.running||!T)){if(clearTimeout(M),clearTimeout(u),e.params.autoplay.disableOnInteraction){v=!1,T=!1;return}v&&e.params.cssMode&&f(),v=!1,T=!1}}),l("slideChange",()=>{e.destroyed||!e.autoplay.running||(L=!0)}),Object.assign(e.autoplay,{start:C,stop:h,pause:w,resume:f})}function Z({spot:E,navigate:e=!1,children:N}){var y,g,m,r;const l=H(),[a,c]=J.useState(E),u=e?()=>l(`/data/${a.id}`):null;return console.log(a),i(R,{children:s("div",{className:"flex flex-col items-center justify-between md:flex-row px-4 py-3 rounded-lg gap-4 border-[1px] border-solid border-gray-300 h-fit",onClick:u,children:[i(Q,{autoplay:{delay:4e3,disableOnInteraction:!1},loop:!0,loopPreventsSliding:!0,slideToClickedSlide:!0,modules:[Y],className:`aspect-video md:w-56 w-[19rem] h-auto  rounded-md ${e?"cursor-pointer":""}`,onClick:u,children:a.images.map(o=>i(W,{children:i("img",{src:`${K.defaults.baseURL}/product/images/${a._id}/${o}`,className:"w-full h-full object-cover"})},o))}),s("div",{className:"flex flex-col justify-between md:px-4 grow md:w-1/3",children:[s("div",{className:"flex flex-col gap-1",children:[s("div",{className:"flex flex-row justify-between flex-wrap",children:[i("p",{className:`font-semibold text-lg ${e?"cursor-pointer":""}`,onClick:u,children:a.name}),s("div",{className:"flex items-center",children:[s("span",{className:"text-black text-sm font-semibold flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1",children:[i(X,{className:"text-brand-primary",fontSize:"inherit",sx:{fontSize:".9rem"}}),a.average_rating||0]}),s("span",{className:"text-gray-600 text-sm ml-2",children:["(",a.total_reviews||0," reviews)"]})]})]}),s("p",{className:"text-xs",children:[(y=a.location)==null?void 0:y.address," "]}),s("p",{className:"text-xs mt-2 text-gray-500 max-w-[70vw] md:max-w-sm lg:max-w-full break-words",children:[(g=a.description)==null?void 0:g.slice(0,255),".."," "]}),i("div",{className:"flex flex-row justify-between items-center",children:i("div",{className:"flex gap-3 items-center flex-wrap",children:(r=(m=a.amenities)==null?void 0:m.slice(0,6))==null?void 0:r.map((o,x)=>s(R,{children:[x>0&&i("span",{className:"text-brand-primary rounded-full bg-brand-primary w-1.5 h-1.5"}),i("p",{className:"text-xs text-gray-600",children:o.name},x)]}))})})]}),s("div",{className:"flex flex-row justify-between items-end mt-3",children:[s("p",{className:"font-semibold text-lg flex items-center flex-wrap",children:[s("span",{className:"whitespace-nowrap",children:["$ ",a.price]}),i("span",{className:"text-[#595959] font-normal text-xs ml-3",children:"per hour"})]}),i("div",{className:"flex gap-5",children:N})]})]})]})})}Z.propTypes={data:j.object.isRequired,children:j.node,navigate:j.bool};export{Z as S};