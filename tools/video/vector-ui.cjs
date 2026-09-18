// Export-only vector layout: independent of browser/device scale.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sharp=require('sharp');
const dir=path.resolve(process.argv[2] || path.join(__dirname,'../../artifacts/video/layers'));
const config=JSON.parse(fs.readFileSync(process.argv[3] || path.join(__dirname,'config.json'),'utf8').replace(/^\uFEFF/,''));
fs.mkdirSync(dir,{recursive:true});
const code=fs.readFileSync(path.join(__dirname,'../../dist/startup-feed.js'),'utf8');
const paths=vm.runInNewContext(code.slice(0,code.indexOf('const icon'))+';paths');
const escape=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const green='#8af970';
const svgIcon=(name,x,y,size,color='#fff',fill='none')=>`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
const txt=(text,x,y,size,color='#fff',weight=400,extra='')=>`<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" fill="${color}" font-weight="${weight}" ${extra}>${escape(text)}</text>`;
const start=(w,h)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
async function png(svg,name,width,height){await sharp(Buffer.from(svg),{density:600}).resize(width,height).png().toFile(`${dir}/${name}-overlay.png`)}
(async()=>{
const clips=config.clips.map(c=>[c.id,c.name,c.category,c.title,c.tags]);
for(let i=0;i<clips.length;i++){
 const [id,name,category,title,tags]=clips[i];
 let s=start(390,752)+`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".13"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".52" stop-color="#000" stop-opacity=".067"/><stop offset=".82" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></linearGradient></defs><rect width="390" height="752" fill="url(#shade)"/>`;
 s+=txt(name,18,601,17,'#fff',700)+txt(category,18,619,11,'#e2e4dd')+svgIcon('arrow',18+category.length*5.7,608,11,'#e2e4dd');
 s+=txt(title,18,644,15,'#fff',500)+txt(tags,18,667,12,'#fff',600)+txt('DEMO STARTUP · SAMPLE FOOTAGE',18,691,8,'#bfc3bc',400,'letter-spacing=".7"');
 s+=`<svg x="339.5" y="487" width="35" height="35" viewBox="0 0 24 24"><path fill="${green}" d="M12 3C6.5 3 2.5 6.3 2.5 10.8c0 2.5 1.3 4.6 3.5 6L5 21l5-2.6c.7.1 1.3.2 2 .2 5.5 0 9.5-3.3 9.5-7.8S17.5 3 12 3Z"/><g fill="#183010"><circle cx="8" cy="10.8" r="1.1"/><circle cx="12" cy="10.8" r="1.1"/><circle cx="16" cy="10.8" r="1.1"/></g></svg>`;
 s+=txt('Message',357,539,11,'#fff',600,'text-anchor="middle"')+svgIcon('bookmark',343.5,555,27,'#fff','#fff')+txt('Save',357,601,11,'#fff',600,'text-anchor="middle"')+svgIcon('share',342,621,30)+txt('Share',357,667,11,'#fff',600,'text-anchor="middle"');
 s+=svgIcon('pause',21,718,16)+svgIcon('mute',55,718,16,'#ccc')+txt(`0${i+1} / ${String(clips.length).padStart(2,'0')}`,372,731,9,'#d4d8cf',400,'text-anchor="end" letter-spacing="1"')+'</svg>';
 await png(s,id,config.feedWidth,config.feedHeight);
}
let c=start(426,872)+`<defs><linearGradient id="body"><stop stop-color="#62635f"/><stop offset=".3" stop-color="#252725"/><stop offset=".6" stop-color="#171917"/><stop offset="1" stop-color="#52534f"/></linearGradient><linearGradient id="status" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".44"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><mask id="hole"><rect width="426" height="872" fill="white"/><path d="M67 14H359A49 49 0 0 1 408 63V766H18V63A49 49 0 0 1 67 14" fill="black"/></mask><clipPath id="screen"><rect x="18" y="14" width="390" height="844" rx="49"/></clipPath></defs>`;
c+=`<g mask="url(#hole)"><rect width="426" height="872" fill="#101112"/><rect x="2" y="169" width="4" height="57" rx="2" fill="#51534f"/><rect x="2" y="241" width="4" height="57" rx="2" fill="#51534f"/><rect x="420" y="210" width="4" height="90" rx="2" fill="#51534f"/><rect x="6" y="2" width="414" height="868" rx="61" fill="url(#body)" stroke="#6c706b"/><rect x="9" y="5" width="408" height="862" rx="58" fill="none" stroke="#1c1d1b" stroke-width="3"/><rect x="17" y="13" width="392" height="846" rx="50" fill="#080908"/><rect x="18" y="14" width="390" height="844" rx="49" fill="#202123"/></g>`;
c+=`<g clip-path="url(#screen)"><rect x="18" y="14" width="390" height="52" fill="url(#status)"/>${txt('9:41',46,46,14,'#fff',700)}<rect x="155" y="25" width="116" height="32" rx="16" fill="#050505"/><circle cx="256" cy="41" r="5" fill="#101522"/>`;
c+=`<g fill="white"><rect x="316" y="39" width="3" height="5" rx="1"/><rect x="321" y="36" width="3" height="8" rx="1"/><rect x="326" y="33" width="3" height="11" rx="1"/><rect x="331" y="30" width="3" height="14" rx="1"/></g><svg x="340" y="30" width="17" height="14" viewBox="0 0 20 15" fill="white"><path d="M0 4a16 16 0 0 1 20 0l-2.4 2.5a12 12 0 0 0-15.2 0ZM4.4 8.4a9 9 0 0 1 11.2 0l-2.4 2.4a5.3 5.3 0 0 0-6.4 0ZM8 12.5a3.2 3.2 0 0 1 4 0L10 15Z"/></svg><rect x="363" y="31" width="23" height="12" rx="3" fill="none" stroke="#fff" stroke-opacity=".5"/><rect x="365" y="33" width="19" height="8" rx="1.5" fill="#fff"/><rect x="388" y="34.5" width="2" height="5" rx="1" fill="#fff" opacity=".5"/>`;
c+='<rect x="18" y="766" width="390" height="72" fill="#202123"/><path d="M18 766H408" stroke="#ffffff18" stroke-width=".5"/>';
const tabs=[['home','Home'],['feed','Feed'],['program','Program'],['clock','My Agenda'],['people','Meetings'],['pin','Map']];
tabs.forEach(([icon,label],i)=>{const x=18+390/6*(i+.5);const color=i===1?green:'#949792';c+=svgIcon(icon,x-10.5,782,21,color)+txt(label,x,821,10,color,400,'text-anchor="middle"');if(i===1)c+=`<rect x="${x-15}" y="766" width="30" height="2" fill="${green}"/>`});
c+='<rect x="149" y="846" width="128" height="4" rx="2" fill="#eceee8"/></g></svg>';
await png(c,'chrome',config.width,config.height);console.log('Vector text, icons, and device frame rendered');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
