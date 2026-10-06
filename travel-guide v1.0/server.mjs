import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {handleApi,providerConfig} from './src/api.mjs';
const port=Number(process.env.PORT||8765);
const assets={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/styles.css':['styles.css','text/css; charset=utf-8'],'/japan-pixel.png':['japan-pixel.png','image/png']};
const server=http.createServer(async(req,res)=>{
 try{
 if(![`localhost:${port}`,`127.0.0.1:${port}`].includes(req.headers.host)){res.writeHead(403);return res.end('Forbidden')}
 const url=new URL(req.url,`http://${req.headers.host}`);
 if(url.pathname.startsWith('/api/')){
 const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>2048){res.writeHead(413,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'INVALID_REQUEST'}))}chunks.push(chunk)}
 const response=await handleApi(new Request(url,{method:req.method,headers:req.headers,...(req.method==='GET'||req.method==='HEAD'?{}:{body:Buffer.concat(chunks)})}),process.env);
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed')}
 const asset=assets[url.pathname];if(!asset){res.writeHead(404);return res.end('Not found')}
 const body=await readFile(new URL('./public/'+asset[0],import.meta.url));res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'SERVER_ERROR'}))}
});
server.listen(port,'127.0.0.1',()=>console.log(`Travel guide ready at http://localhost:${port}/ (AI ${providerConfig(process.env).key?'configured':'not configured'}; ${providerConfig(process.env).provider})`));
