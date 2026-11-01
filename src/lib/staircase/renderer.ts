import {createStaircaseModel,staircaseCamera,posterViewCorners,JOURNEY_STATIONS,MATERIALS,type Vec3} from "./model";

// The immutable CPU geometry is shared across route/motion-driven GPU recreation.
let cachedModel:ReturnType<typeof createStaircaseModel>|null=null;
const getModel=()=>cachedModel??(cachedModel=createStaircaseModel());

// Lazy WebGL2 mesh renderer. Scroll/resize request frames; no perpetual loop.
const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUv;layout(location=3) in float aShade;
uniform mat4 uVP;uniform mat4 uLightVP;
out vec3 vWorld;out vec3 vNormal;out vec2 vUv;out float vShade;out vec4 vShadow;
void main(){vWorld=aPosition;vNormal=aNormal;vUv=aUv;vShade=aShade;vShadow=uLightVP*vec4(aPosition,1.);gl_Position=uVP*vec4(aPosition,1.);}`;
const FRAG=`#version 300 es
precision highp float;
in vec3 vWorld;in vec3 vNormal;in vec2 vUv;in float vShade;in vec4 vShadow;
uniform sampler2D uMap;uniform highp sampler2D uShadow;uniform vec3 uColor;uniform vec3 uEye;uniform vec3 uLight;
uniform float uRoughness;uniform float uMetallic;uniform float uShadowSize;uniform int uKind;uniform bool uHasShadow;out vec4 outColor;
float shadow(){
 if(!uHasShadow)return 1.;vec3 p=vShadow.xyz/vShadow.w*.5+.5;
 if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;
 float bias=max(.00018,.0007*(1.-max(dot(normalize(vNormal),uLight),0.))),s=0.;
 for(int x=0;x<2;x++)for(int y=0;y<2;y++){vec2 off=(vec2(float(x),float(y))-.5)/uShadowSize;float d=texture(uShadow,p.xy+off).r;s+=p.z-bias>d?.24:1.;}return s*.25;
}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
// Arc-length position matches the capsule mesh, so wear and contact shade follow each tread.
float stairArc(vec2 p){
 float d;if(abs(p.x)<=1.1)d=p.y>=0.?1.1-p.x:2.2+3.14159265*1.06+p.x+1.1;
 else if(p.x< -1.1){float a=atan(p.y,p.x+1.1);if(a<1.5707963)a+=6.2831853;d=2.2+(a-1.5707963)*1.06;}
 else d=4.4+3.14159265*1.06+(atan(p.y,p.x-1.1)+1.5707963)*1.06;
 return d/(4.4+6.2831853*1.06);
}
float windowLight(vec3 n,float level){
 vec3 toWindow=vec3(-vWorld.x,1.8+level*3.096-vWorld.y,-1.51-vWorld.z);
 return max(dot(n,normalize(toWindow)),0.)/(1.+dot(toWindow,toWindow)*.32);
}
void main(){
 if(uKind>=6&&uKind<=8){outColor=vec4(texture(uMap,vUv).rgb,1.);return;}
 vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 albedo=uColor,modulation=vec3(1.);float rough=uRoughness,ao=1.;
 if(uKind==0||uKind==2||uKind==3){
  vec3 texel=texture(uMap,vUv).rgb;modulation=clamp(texel/.75,.56,1.4);
  vec2 texelStep=uKind==2?vec2(1./1024.,1./128.):vec2(1./512.);
  float h=texel.r,bx=texture(uMap,vUv+vec2(texelStep.x,0.)).r-h,by=texture(uMap,vUv+vec2(0.,texelStep.y)).r-h;
  vec3 dp1=dFdx(vWorld),dp2=dFdy(vWorld);vec2 du1=dFdx(vUv),du2=dFdy(vUv);
  vec3 t=dp1*du2.y-dp2*du1.y,b=dp2*du1.x-dp1*du2.x;
  float relief=uKind==3?.20:uKind==0?.65:.4;
  float uvDirection=du1.x*du2.y-du1.y*du2.x<0.?-1.:1.;
  if(length(t)>.0001&&length(b)>.0001)n=normalize(n-(normalize(t)*bx+normalize(b)*by)*relief*uvDirection);
 }
 float radius=length(vec2(max(abs(vWorld.x)-1.1,0.),vWorld.z));
 float arc=stairArc(vWorld.xz),phase=fract(arc*36.);
 if(uKind==0){
  float across=clamp((radius-.5)/1.1,0.,1.);
  float treadIndex=floor(vWorld.y/.172+.04),variation=sin(treadIndex*2.17);
  albedo*=mix(vec3(.94,.96,1.01),vec3(1.04,1.015,.965),variation*.5+.5);
  if(n.y>.65){
   float oval=pow((across-(.49+.025*sin(treadIndex*1.73)))/(.35+.02*cos(treadIndex*2.1)),2.)+pow((phase-(.43+.025*cos(treadIndex*.89)))/.42,2.);
   float worn=1.-smoothstep(.65,1.,oval),rim=1.-smoothstep(.035,.16,abs(oval-1.));
   // Cool, polished foot-wear and its shallow dark outline are present in the reference treads.
   albedo=mix(albedo,albedo*vec3(.94,.97,1.025),worn*.65);albedo*=1.-rim*.05;
   rough=mix(rough,.57,worn*.7);ao*=mix(.79,1.,smoothstep(.012,.12,phase));
  }else ao*=n.y<-.4?.67:.86;
  ao*=mix(.73,1.,smoothstep(.015,.31,1.7-radius));
 }
 if(uKind==2){
  float joint=min(fract(vUv.x*.8),1.-fract(vUv.x*.8));
  albedo*=1.-(1.-smoothstep(.002,.013,joint))*.24;
  rough*=.86+.14*sin(vUv.x*3.1);
 }
 if(uKind==3){
  float warm=.5+.5*sin(vWorld.y*.37+vWorld.x*.65-vWorld.z*.32);
  albedo*=mix(vec3(.92,.95,1.025),vec3(1.055,1.005,.91),warm);
  float aboveFlight=mod(vWorld.y-arc*6.192+12.384,6.192);
  ao*=mix(.70,1.,smoothstep(.18,1.05,aboveFlight));
  if(n.y<-.4)ao*=.72;
 }
 vec3 base=pow(max(albedo,vec3(0.)),vec3(2.2))*modulation;float sh=shadow();
 float heightLight=smoothstep(.3,14.8,vWorld.y);
 vec3 hemi=mix(vec3(.48,.38,.28),vec3(.72,.80,.91),n.y*.5+.5);
 float windowLevel=clamp((vWorld.y-1.8)/3.096,0.,3.),lower=floor(windowLevel);
 float windowFill=mix(windowLight(n,lower),windowLight(n,min(lower+1.,3.)),smoothstep(0.,1.,fract(windowLevel)));
 // Cooler window light, warm stone bounce and real shadow retain the photographed tonal depth.
 vec3 diffuse=hemi*mix(.29,.43,heightLight)+vec3(1.,.91,.75)*max(dot(n,uLight),0.)*.52*sh;
 diffuse+=vec3(.72,.84,1.)*windowFill*.68+vec3(.16,.105,.055)*(1.-heightLight)*max(-n.y,0.);
 vec3 view=normalize(uEye-vWorld),halfway=normalize(view+uLight),f0=mix(vec3(.045),base,uMetallic);
 vec3 spec=f0*pow(max(dot(n,halfway),0.),mix(170.,10.,rough))*(1.-rough)*3.0*sh;
 if(uKind==1)spec+=vec3(.045,.055,.07)*pow(1.-max(dot(n,view),0.),4.)*.36;
 vec3 color=(base*diffuse*vShade*ao+spec)*.98;
 if(uKind==5)color=base*(1.25+.09*sin(vWorld.x*143.)*sin(vWorld.y*177.));
 color=pow(aces(color),vec3(1./2.2));float fog=1.-exp(-length(uEye-vWorld)*.009);
 outColor=vec4(mix(color,vec3(.255,.24,.205),fog),1.);
}`;
const DEPTH_VERT=`#version 300 es
layout(location=0) in vec3 aPosition;uniform mat4 uVP;void main(){gl_Position=uVP*vec4(aPosition,1.);}`;
const DEPTH_FRAG=`#version 300 es
precision highp float;out vec4 outColor;void main(){outColor=vec4(1.);}`;

const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const norm=(v:Vec3):Vec3=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n) as Vec3};
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function lookAt(eye:Vec3,target:Vec3){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
function perspective(fov:number,aspect:number,near=.04,far=70){const f=1/Math.tan(fov*Math.PI/360);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0])}
function ortho(l:number,r:number,b:number,t:number,n:number,f:number){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])}
function multiply(a:Float32Array,b:Float32Array){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function program(gl:WebGL2RenderingContext,vs:string,fs:string){
 const shaders=[vs,fs].map((src,i)=>{const s=gl.createShader(i===0?gl.VERTEX_SHADER:gl.FRAGMENT_SHADER)!;gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||"Stair shader compile failed");return s});
 const p=gl.createProgram()!;shaders.forEach(s=>gl.attachShader(p,s));gl.linkProgram(p);shaders.forEach(s=>gl.deleteShader(s));if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||"Stair shader link failed");return p;
}
type GpuMesh={vao:WebGLVertexArrayObject;vbo:WebGLBuffer;ibo:WebGLBuffer;count:number;material:number;castsShadow:boolean};
type PhotoRect={left:number;top:number;width:number;height:number};
function projectedBounds(vp:Float32Array,corners:Vec3[]){
 const points=corners.map(point=>{const v=[...point,1],clip=[0,0,0,0];for(let r=0;r<4;r++)for(let c=0;c<4;c++)clip[r]+=vp[c*4+r]*v[c];return {x:clip[0]/clip[3],y:clip[1]/clip[3]}});
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);return {left:Math.min(...xs),right:Math.max(...xs),bottom:Math.min(...ys),top:Math.max(...ys)};
}
function fitWallDisplay(vp:Float32Array,focusVP:Float32Array,corners:Vec3[],photoCorners:Vec3[],rect:PhotoRect,width:number,height:number,weight:number){
 const box=projectedBounds(focusVP,corners),photo=projectedBounds(focusVP,photoCorners),targetWidth=rect.width/width*2,targetHeight=rect.height/height*2;
 const baseScale=Math.min(1,targetWidth/(box.right-box.left),targetHeight/(box.top-box.bottom));
 // Bring the offer photographs closer, capped by the complete source photo's safe fit.
 const scale=Math.min(baseScale*1.22,targetWidth/(photo.right-photo.left),targetHeight/(photo.top-photo.bottom));
 const left=rect.left/width*2-1,right=left+targetWidth,top=1-rect.top/height*2,bottom=top-targetHeight;
 const x=Math.max(left-photo.left*scale,Math.min(right-photo.right*scale,(left+right)/2-(box.left+box.right)/2*scale));
 // Keep the branded top of the wall display visible whenever the complete photo still fits.
 const y=Math.max(bottom-photo.bottom*scale,Math.min(top-box.top*scale,(top+bottom)/2-(box.top+box.bottom)/2*scale));
 const zoom=1+(scale-1)*weight;
 // A smooth lens shift keeps the display frontal while placing it clear of the UI.
 for(let c=0;c<4;c++){vp[c*4]=vp[c*4]*zoom+x*weight*vp[c*4+3];vp[c*4+1]=vp[c*4+1]*zoom+y*weight*vp[c*4+3]}
}
export type StaircaseRenderer={setProgress:(progress:number)=>void;setVisible:(visible:boolean)=>void;destroy:()=>void};

export function createStaircaseRenderer(canvas:HTMLCanvasElement,onFallback:()=>void,onReady:()=>void):StaircaseRenderer{
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:true,powerPreference:"low-power",depth:true,stencil:false,preserveDrawingBuffer:false});
 if(!gl)throw Error("WebGL2 unavailable");
 const phone=window.matchMedia("(pointer: coarse) and (max-width: 767px), (pointer: coarse) and (max-height: 500px) and (max-width: 1023px)").matches;
 const shadowSize=phone?1024:2048;
 const phoneLandscape=window.matchMedia("(pointer: coarse) and (min-width: 768px) and (max-height: 500px) and (max-width: 1023px)");
 const cacheHit=cachedModel!==null;
 const main=program(gl,VERT,FRAG),depth=program(gl,DEPTH_VERT,DEPTH_FRAG),model=getModel();
 canvas.dataset.modelCache=cacheHit?"hit":"miss";canvas.dataset.frames="0";
 const meshes:GpuMesh[]=model.map(mesh=>{
  const vao=gl.createVertexArray()!,vbo=gl.createBuffer()!,ibo=gl.createBuffer()!;gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
  for(const [location,size,offset]of [[0,3,0],[1,3,12],[2,2,24],[3,1,32]]){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,36,offset)}
  return {vao,vbo,ibo,count:mesh.indices.length,material:mesh.material,castsShadow:mesh.castsShadow};
 });gl.bindVertexArray(null);
 const uniforms=Object.fromEntries(["VP","LightVP","Map","Shadow","Color","Eye","Light","Roughness","Metallic","Kind","HasShadow","ShadowSize"].map(name=>[name,gl.getUniformLocation(main,"u"+name)]));
 const textures:WebGLTexture[]=[],textureForMaterial=new Map<number,WebGLTexture>();
 let destroyed=false,lostContext=false,texturesReady=false,readyNotified=false,visible=true,progress=0,frame=0,renderedFrames=0,width=1,height=1,textureRevision=0,lastTextureRevision=-1,lastBufferWidth=0,lastBufferHeight=0;
 let lastVP:Float32Array|null=null;
 const photoRects=new Map<string,PhotoRect>(),scene=canvas.closest<HTMLElement>(".scene");
 const pendingImages:HTMLImageElement[]=[],cancelImages:(()=>void)[]=[];
 const loadTexture=async(index:number,url:string)=>{
  const texture=gl.createTexture()!;textures.push(texture);textureForMaterial.set(index,texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([191,191,191,255]));
  const img=new Image();pendingImages.push(img);await new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);img.onload=null;img.onerror=null;resolve()};const timer=setTimeout(done,5000);cancelImages.push(()=>{img.src="";done()});img.onload=done;img.onerror=done;img.src=url});
  if(destroyed||lostContext)return;if(!img.naturalWidth)throw Error("Stair texture unavailable: "+url);
  try{await img.decode()}catch{/* Loaded images can still upload if decode() is unavailable or rejected. */}
  if(destroyed||lostContext)return;if(!img.naturalWidth)throw Error("Stair texture unavailable: "+url);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,index>=6?gl.CLAMP_TO_EDGE:gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,index>=6?gl.CLAMP_TO_EDGE:gl.REPEAT);
  const anisotropy=gl.getExtension("EXT_texture_filter_anisotropic");if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  textureRevision++;
 };
 const shadowTexture=gl.createTexture()!,framebuffer=gl.createFramebuffer()!;gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,shadowSize,shadowSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowTexture,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
 const hasShadow=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
 const lightEye:Vec3=[-3,17,-5],lightTarget:Vec3=[0,5,0],lightVP=multiply(ortho(-5,5,-9,9,.1,35),lookAt(lightEye,lightTarget));
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 if(hasShadow){gl.viewport(0,0,shadowSize,shadowSize);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(depth);gl.uniformMatrix4fv(gl.getUniformLocation(depth,"uVP"),false,lightVP);
  for(const mesh of meshes)if(mesh.castsShadow){gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_INT,0)}
 }gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const render=()=>{
  frame=0;if(destroyed||lostContext||!texturesReady||!visible||document.hidden||!width||!height)return;
  const mobile=width<768,photoOnly=mobile||phoneLandscape.matches,{eye,target,focus}=staircaseCamera(progress,mobile);
  const vp=multiply(perspective(mobile?64:60,width/height),lookAt(eye,target));
  if(focus){
   const rect=photoRects.get(focus.station.id);
   if(rect){
    const focusVP=multiply(perspective(mobile?64:60,width/height),lookAt(focus.eye,focus.target));
    const photoCorners=posterViewCorners(focus.station,true);
    fitWallDisplay(vp,focusVP,photoOnly?photoCorners:posterViewCorners(focus.station,false),photoCorners,rect,width,height,focus.weight);
    if(focus.weight>.999){
     const bounds=projectedBounds(vp,photoCorners);
     canvas.dataset.photoBounds=JSON.stringify({left:(bounds.left+1)*width/2,right:(bounds.right+1)*width/2,top:(1-bounds.top)*height/2,bottom:(1-bounds.bottom)*height/2});
     canvas.dataset.photoSafe=JSON.stringify(rect);
    }else{delete canvas.dataset.photoBounds;delete canvas.dataset.photoSafe}
   }
  }else{delete canvas.dataset.photoBounds;delete canvas.dataset.photoSafe}
  // Metadata follows every scroll update, including a chapter's stationary camera hold.
  canvas.dataset.progress=progress.toFixed(4);canvas.dataset.cameraY=eye[1].toFixed(3);canvas.dataset.camera=eye.map(v=>v.toFixed(3)).join(",");
  if(lastVP&&lastBufferWidth===canvas.width&&lastBufferHeight===canvas.height&&lastTextureRevision===textureRevision&&vp.every((value,index)=>value===lastVP![index]))return;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.255,.24,.205,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(main);
  gl.uniformMatrix4fv(uniforms.VP,false,vp);gl.uniformMatrix4fv(uniforms.LightVP,false,lightVP);gl.uniform3fv(uniforms.Eye,eye);gl.uniform3fv(uniforms.Light,norm(sub(lightEye,lightTarget)));gl.uniform1i(uniforms.HasShadow,hasShadow?1:0);gl.uniform1f(uniforms.ShadowSize,shadowSize);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.uniform1i(uniforms.Shadow,1);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(uniforms.Map,0);
  for(const mesh of meshes){const material=MATERIALS[mesh.material];gl.bindTexture(gl.TEXTURE_2D,textureForMaterial.get(mesh.material)??textureForMaterial.get(0)!);gl.uniform3f(uniforms.Color,material.color[0],material.color[1],material.color[2]);gl.uniform1f(uniforms.Roughness,material.roughness);gl.uniform1f(uniforms.Metallic,material.metallic);gl.uniform1i(uniforms.Kind,mesh.material);gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_INT,0)}
  gl.bindVertexArray(null);lastVP=vp;lastBufferWidth=canvas.width;lastBufferHeight=canvas.height;lastTextureRevision=textureRevision;canvas.dataset.frames=String(++renderedFrames);
  // Keep the photo poster until a fully textured main pass actually exists.
  if(!readyNotified){readyNotified=true;onReady()}
 };
 const schedule=()=>{if(!destroyed&&!lostContext&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(render)};
 const resize=()=>{
  const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
  const header=document.querySelector<HTMLElement>(".site-header")?.offsetHeight??80,nav=scene?.querySelector<HTMLElement>(".journey-nav"),mobile=width<768;
  for(const station of JOURNEY_STATIONS){
   const card=scene?.querySelector<HTMLElement>(".journey-offer--"+station.id);if(!card)continue;
   const landscape=phoneLandscape.matches;
   const left=landscape?16:mobile?20:width*.045,top=header+(landscape?12:16),right=landscape?card.offsetLeft-20:mobile?width-20:card.offsetLeft-32,bottom=landscape?(nav?.offsetTop??height-57)-12:mobile?card.offsetTop-18:(nav?.offsetTop??height-150)-24;
   photoRects.set(station.id,{left,top,width:Math.max(40,right-left),height:Math.max(40,bottom-top)});
  }
  const dpr=Math.min(window.devicePixelRatio||1,width<768?1.25:1.5),bufferWidth=Math.max(1,Math.round(width*dpr)),bufferHeight=Math.max(1,Math.round(height*dpr));
  if(canvas.width!==bufferWidth)canvas.width=bufferWidth;if(canvas.height!==bufferHeight)canvas.height=bufferHeight;schedule();
 };
 const observer=new ResizeObserver(resize);observer.observe(canvas);scene?.querySelectorAll(".journey-offer").forEach(card=>observer.observe(card));
 const lost=(event:Event)=>{event.preventDefault();lostContext=true;visible=false;if(frame)cancelAnimationFrame(frame);frame=0;onFallback()};canvas.addEventListener("webglcontextlost",lost);
 canvas.dataset.vertices=String(model.reduce((sum,m)=>sum+m.vertices.length/9,0));canvas.dataset.triangles=String(model.reduce((sum,m)=>sum+m.indices.length/3,0));
 void Promise.all(MATERIALS.map((material,index)=>material.texture?loadTexture(index,"/assets/models/staircase/"+material.texture):Promise.resolve())).then(()=>{
  if(destroyed)return;if(gl.isContextLost()){onFallback();return}texturesReady=true;resize();if(frame){cancelAnimationFrame(frame);frame=0}render();
 }).catch(()=>{if(!destroyed)onFallback()});
 return {
  setProgress:(value)=>{progress=Math.max(0,Math.min(1,value));canvas.dataset.progress=progress.toFixed(4);schedule()},
  setVisible:(value)=>{visible=value;if(value)schedule();else if(frame){cancelAnimationFrame(frame);frame=0}},
  destroy:()=>{if(destroyed)return;destroyed=true;cancelImages.forEach(cancel=>cancel());if(frame)cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("webglcontextlost",lost);for(const img of pendingImages){img.onload=null;img.onerror=null}for(const m of meshes){gl.deleteBuffer(m.vbo);gl.deleteBuffer(m.ibo);gl.deleteVertexArray(m.vao)}textures.forEach(t=>gl.deleteTexture(t));gl.deleteTexture(shadowTexture);gl.deleteFramebuffer(framebuffer);gl.deleteProgram(main);gl.deleteProgram(depth);gl.getExtension("WEBGL_lose_context")?.loseContext()},
 };
}
