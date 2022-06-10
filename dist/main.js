import*as a from"fs";import*as e from"path";import t from"axios";import o from"axios-retry";import n from"qs";import{XMLParser as r}from"fast-xml-parser";import{isUndefined as s}from"lodash-es";o(t,{retries:3});let i="",c="",d="";async function m(a,{serial:e,state:t,town:o,road:n}){let r=null;switch(!0){case!s(n):console.warn(`开始获取 ${t} - ${o} - ${n} 的店铺地址`),r=await async function(a,e,t){const o={commandid:"SearchStore",city:a,town:e,roadname:t,ID:"",StoreName:"",SpecialStore_Kind:"",leftMenuChecked:"",address:""};return await l(o,"GeoPosition",(a=>({label:`<${a.POIName}> ${a.Address}`,value:`<${a.POIName}> ${a.Address}`})))}(t,o,n);break;case!s(o):console.warn(`开始获取 ${t} - ${o} 的街道`),r=await async function(a,e){const t={commandid:"SearchRoad",city:a,town:e,ID:"",StoreName:"",SpecialStore_Kind:"",leftMenuChecked:""};return await l(t,"RoadName",(a=>({label:a.rd_name_1+a.section_1,value:a.rd_name_1+a.section_1,road:a.rd_name_1+a.section_1,children:[]})))}(t,o);break;case!s(e):console.warn(`开始获取 ${t} 的下属地区`),r=await async function(a){const e={commandid:"GetTown",cityid:a,leftMenuChecked:""};return await l(e,"GeoPosition",(a=>({label:a.TownName,value:a.TownName,town:a.TownName,children:[]})))}(e)}return r&&(a.children=r),r}function l(a,e,o){return new Promise((s=>{setTimeout((async()=>{const{status:i,data:c}=await t.post("https://emap.pcsc.com.tw/EMapSDK.aspx",n.stringify(a));if(200!==i)throw new Error(`${e} 请求错误.`);{const a=(new r).parse(c),t=a.iMapSDKOutput[e];Array.isArray(t)?s(t.map(o)):s(t?[o(t)]:[])}}),2e3)}))}(function t(o,n){const r=o.map(((o,l)=>async function(){i=s(o.state)?i:o.state,c=s(o.state)?o.town?o.town:c:void 0,d=s(o.state)&&s(o.town)?s(o.road)?d:o.road:void 0;const w=await m(o,{serial:o.serial,state:i,town:c,road:d});w[0]&&!s(w[0].children)&&await t(w,n+1)[0]();const u=r[++l];n||a.writeFileSync(e.resolve(process.cwd(),`./dist/${i}.json`),JSON.stringify(o)),u&&await u()}));return r})([["01","台北市"],["02","基隆市"],["03","新北市"],["04","桃園市"],["05","新竹市"],["06","新竹縣"],["07","苗栗縣"],["08","台中市"],["10","彰化縣"],["11","南投縣"],["12","雲林縣"],["13","嘉義市"],["14","嘉義縣"],["15","台南市"],["17","高雄市"],["19","屏東縣"],["20","宜蘭縣"],["21","花蓮縣"],["22","台東縣"],["23","澎湖縣"],["24","連江縣"],["25","金門縣"]].map((a=>({label:a[1],value:a[1],state:a[1],serial:a[0],children:[]}))),0)[0]();
