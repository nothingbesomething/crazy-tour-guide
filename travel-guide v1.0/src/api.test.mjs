import test from 'node:test';
import assert from 'node:assert/strict';
import {handleApi,validCity,validateGuide} from './api.mjs';
const p=(en,ja)=>({en,ja});
const row={title:p('Tokyo','東京'),description:p('A city walk.','街歩き。'),duration:p('2 hours','2時間')};
const fixture=()=>({status:'ok',city:p('Tokyo','東京'),prefecture:p('Tokyo Metropolis','東京都'),summary:p('Explore Tokyo.','東京を巡る。'),trip_days:2,nights:1,attractions:[row,row,row],transport:[row,row,row],budget:[{label:p('Stay','宿泊'),min:8000,max:12000},{label:p('Food','食事'),min:6000,max:10000}],itinerary:[row,row],sources:[{title:'Official Tokyo guide',url:'https://www.gotokyo.org/en/'}]});
const request=(body={city:'Tokyo'},origin='http://localhost:8765')=>new Request('http://localhost:8765/api/guide',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
const upstream=(guide=fixture())=>({status:'completed',output:[{type:'web_search_call',status:'completed',action:{sources:[{title:'Official Tokyo guide',url:'https://www.gotokyo.org/en/'}]}},{type:'message',content:[{type:'output_text',text:JSON.stringify(guide)}]}]});
const env={OPENAI_API_KEY:'unit-test-only'};
test('accepts Japanese and romanized city names, rejects malformed input',()=>{assert.ok(validCity('京都'));assert.ok(validCity('Kōbe'));assert.ok(validCity('Fuchū, Tokyo'));assert.equal(validCity(''),false);assert.equal(validCity('<script>'),false);assert.equal(validCity('A'.repeat(81)),false)});
test('missing service configuration is explicit and never fabricates a guide',async()=>{const r=await handleApi(request(),{});assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'NOT_CONFIGURED'})});
test('rejects cross-origin posts and invalid body before calling the model',async()=>{assert.equal((await handleApi(request({},'https://elsewhere.example'),env)).status,403);assert.equal((await handleApi(request({city:'<script>'}),env)).status,400);assert.equal((await handleApi(request(null),env)).status,400)});
test('calls Responses API and returns bilingual result with researched sources',async()=>{let called=false;const r=await handleApi(request(),env,{skipRateLimit:true,fetch:async(url,init)=>{called=true;assert.equal(url,'https://api.openai.com/v1/responses');const b=JSON.parse(init.body);assert.equal(JSON.parse(b.input).city,'Tokyo');assert.equal(b.text.format.strict,true);assert.equal(b.tools[0].type,'web_search');assert.equal(b.store,false);return Response.json(upstream())}});const data=await r.json();assert.equal(r.status,200);assert.ok(called);assert.equal(data.guide.city.ja,'東京');assert.equal(data.guide.city.en,'Tokyo');assert.equal(data.guide.sources.length,1);assert.ok(data.guide.generated_at);assert.equal(JSON.stringify(data).includes('unit-test-only'),false)});
test('rejects malformed budgets and unsourced results',async()=>{const g=fixture();g.budget[0].max=1;assert.equal(validateGuide(g),false);const payload=upstream();payload.output.shift();const r=await handleApi(request(),env,{skipRateLimit:true,fetch:async()=>Response.json(payload)});assert.equal(r.status,502);assert.equal((await r.json()).error,'UNVERIFIED_RESULT')});
test('unknown city and upstream rate limit produce recoverable errors',async()=>{const a=await handleApi(request(),env,{skipRateLimit:true,fetch:async()=>Response.json(upstream({status:'not_found'}))});assert.equal(a.status,422);const b=await handleApi(request(),env,{skipRateLimit:true,fetch:async()=>new Response('limited',{status:429})});assert.equal(b.status,429)});

test('quota exhaustion is distinguished from temporary rate limiting',async()=>{const r=await handleApi(request(),env,{skipRateLimit:true,fetch:async()=>Response.json({error:{type:'insufficient_quota',code:'credit_balance_exhausted'}},{status:429})});assert.equal(r.status,503);assert.equal((await r.json()).error,'API_QUOTA')});

test('Gemini returns the same bilingual guide shape without live-search claims',async()=>{
 const r=await handleApi(request(),{AI_PROVIDER:'gemini',GEMINI_API_KEY:'gemini-test-only',OPENAI_API_KEY:'never-use-this'},{skipRateLimit:true,fetch:async(url,init)=>{
  assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/interactions');assert.equal(init.headers['x-goog-api-key'],'gemini-test-only');assert.equal(init.headers.Authorization,undefined);
  const body=JSON.parse(init.body);assert.equal(body.model,'gemini-3.8-flash');assert.equal(body.store,false);assert.equal(body.tools,undefined);assert.equal(body.response_format.mime_type,'application/json');assert.equal(JSON.parse(body.input).city,'Tokyo');
  return Response.json({status:'completed',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify(fixture())}]}]});
 }});
 const data=await r.json();assert.equal(r.status,200);assert.equal(data.guide.city.ja,'東京');assert.equal(data.guide.city.en,'Tokyo');assert.equal(data.guide.provider,'gemini');assert.equal(data.guide.grounded,false);assert.deepEqual(data.guide.sources,[]);assert.equal(JSON.stringify(data).includes('gemini-test-only'),false);
});
test('explicit Gemini configuration never falls back to OpenAI when Gemini key is missing',async()=>{
 let called=false;const r=await handleApi(request(),{AI_PROVIDER:'gemini',OPENAI_API_KEY:'present'},{fetch:async()=>{called=true;throw Error('must not be called')}});assert.equal(r.status,503);assert.equal(called,false);assert.equal((await r.json()).error,'NOT_CONFIGURED');
});
test('Gemini status reports selected provider without exposing credentials',async()=>{
 const r=await handleApi(new Request('http://localhost:8765/api/status'),{AI_PROVIDER:'gemini',GEMINI_API_KEY:'gemini-test-only'});assert.deepEqual(await r.json(),{ai_configured:true,provider:'gemini',web_grounded:false});
});
test('Gemini permission and quota errors are recoverable',async()=>{
 for(const [status,error] of [[403,'AI_AUTH'],[429,'BUSY'],[503,'BUSY']]){const r=await handleApi(request(),{AI_PROVIDER:'gemini',GEMINI_API_KEY:'test-only'},{skipRateLimit:true,fetch:async()=>Response.json({error:{status:'DENIED'}},{status})});assert.equal((await r.json()).error,error)}
});
test('Gemini rejects incomplete or malformed outputs rather than displaying them',async()=>{
 for(const payload of [{status:'in_progress',steps:[]},{status:'completed',steps:[{type:'model_output',content:[{type:'text',text:'not JSON'}]}]}]){const r=await handleApi(request(),{AI_PROVIDER:'gemini',GEMINI_API_KEY:'test-only'},{skipRateLimit:true,fetch:async()=>Response.json(payload)});assert.equal(r.status,502)}
});
