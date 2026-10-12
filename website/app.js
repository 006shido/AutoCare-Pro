'use strict';
const screens={
  workspace:{title:'Your daily toolkit, in one place.',alt:'Manager home screen with workshop statistics and daily tools',description:'Start with a clear overview, then jump straight into jobs, vehicles and team tools.'},
  jobs:{title:'A clear view of work in progress.',alt:'Workshop service job board with vehicle cards organized by job status',description:'See the job stages across your workshop and keep work moving from inspection to completion.'},
  vehicles:{title:'Every vehicle. All the details.',alt:'Vehicle list with customer, make, model and maintenance information',description:'Find vehicle records, customer details and service information without hunting through paperwork.'},
  services:{title:'Shared records, from manager to worker.',alt:'Worker service records showing a remotely added service after automatic sync',description:'Service changes appear in linked worker sessions. Review jobs, costs and invoices in the same workspace.'},
  reminders:{title:'Stay ahead of the next service.',alt:'Maintenance reminder screen showing the workshop vehicle schedule',description:'Review service reminders and maintenance timing before the next visit.'}
};
const tabs=[...document.querySelectorAll('[data-screen]')];
let selectedScreen='workspace';
function selectScreen(tab,focus=false){
  selectedScreen=tab.dataset.screen;const screen=screens[selectedScreen];
  tabs.forEach(item=>{item.setAttribute('aria-selected',String(item===tab));item.tabIndex=item===tab?0:-1;});
  document.querySelector('#screen-image').src=`assets/${selectedScreen}.png`;
  document.querySelector('#screen-image').alt=screen.alt;
  document.querySelector('#screen-label').textContent=screen.title;
  document.querySelector('#screen-description').textContent=screen.description;
  document.querySelector('#screen-panel').setAttribute('aria-labelledby',tab.id);
  if(focus)tab.focus();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectScreen(tab));
  tab.addEventListener('keydown',event=>{
    let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectScreen(tabs[next],true);}
  });
});
const dialog=document.querySelector('#image-dialog');
document.querySelector('#expand-screen').addEventListener('click',()=>{
  const image=document.querySelector('#dialog-image');image.src=`assets/${selectedScreen}.png`;image.alt=screens[selectedScreen].alt;dialog.showModal();
});
document.querySelector('#close-image').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.querySelector('#year').textContent=new Date().getFullYear();

// Keep downloads current without ever requesting an account token or workshop data.
async function refreshDownloads(){
  try{
    const response=await fetch('https://api.github.com/repos/006shido/AutoCare-Pro/releases/latest',{signal:AbortSignal.timeout(6000),headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok)return;const release=await response.json();
    if(release.draft||release.prerelease||!/^v?\d+\.\d+\.\d+$/.test(release.tag_name))return;
    const version=release.tag_name.replace(/^v/,'');
    const expected={windows:`AutoCare-Pro-${version}.msi`,arm64:`AutoCare-Pro-${version}-macos-arm64.pkg`,x64:`AutoCare-Pro-${version}-macos-x64.pkg`};
    const urls={};
    for(const [platform,name] of Object.entries(expected)){
      const asset=release.assets?.find(item=>item.name===name);if(!asset)return;
      const url=new URL(asset.browser_download_url);
      if(url.protocol!=='https:'||url.hostname!=='github.com'||!url.pathname.startsWith('/006shido/AutoCare-Pro/releases/download/'))return;
      urls[platform]=url.href;
    }
    document.querySelectorAll('[data-version]').forEach(element=>element.textContent=`Version ${version}`);
    document.querySelectorAll('[data-download]').forEach(link=>link.href=urls[link.dataset.download]);
  }catch{ /* The verified 1.0.7 download links remain available if the release API is unavailable. */ }
}
refreshDownloads();
