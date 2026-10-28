const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const menu=$("#menu"),nav=$("#nav"),toast=$("#toast");let timer;
function notify(text){toast.textContent=text;toast.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove("show"),2500)}
menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"✕":"☰";menu.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú")});
$$(".header nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="☰";$$(".header nav a").forEach(x=>x.classList.toggle("active",x===a))}));
if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$(".header nav a").forEach(a=>a.classList.toggle("active",a.hash==="#"+e.target.id))}),{rootMargin:"-25% 0px -65% 0px"});$$("main section[id]").forEach(s=>observer.observe(s))}
const KEY="pensamientosPracticaPreguntasV1";let questions=[];try{questions=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(questions))}catch{}}
function render(){const ul=$("#savedQuestions");ul.innerHTML="";questions.forEach((q,i)=>{const li=document.createElement("li"),span=document.createElement("span"),btn=document.createElement("button");span.textContent=q;btn.textContent="Quitar";btn.type="button";btn.addEventListener("click",()=>{questions.splice(i,1);save();render();notify("Pregunta eliminada de este navegador.")});li.append(span,btn);ul.append(li)})}
$("#addQuestion").addEventListener("click",()=>{const input=$("#newQuestion"),q=input.value.trim();if(!q){notify("Escribe una pregunta antes de guardarla.");input.focus();return}questions.unshift(q);questions=questions.slice(0,30);save();render();input.value="";notify("Tu pregunta quedó guardada en este dispositivo. ✨")});
$("#newQuestion").addEventListener("keydown",e=>{if(e.key==="Enter")$("#addQuestion").click()});render();
