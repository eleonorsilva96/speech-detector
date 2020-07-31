
const { username, perfil } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//Switch pages
console.log(perfil);
if(perfil === "0"){
  window.document.location =`./chat.html?perfil=${perfil}&username=${username}`
} else{
  window.document.location =`./nome.html?perfil=${perfil}`
} 

