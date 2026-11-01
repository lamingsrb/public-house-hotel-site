/**
 * Photo-referenced reconstruction of the Public House stairwell.
 * References: ColorMix_24 (well / flights), stairs (iron / wood), stairs-window.
 * Dimensions are inferred proportions, not a survey. A capsule plan keeps the
 * straight flights and fan winders visible in the photographs (not a helix).
 * Shared by the browser renderer and the reproducible GLB exporter.
 */
export type Vec3 = [number, number, number];
export type StairMesh = { name: string; material: number; vertices: Float32Array; indices: Uint32Array; castsShadow: boolean };
export const STAIR = { halfStraight: 1.1, innerRadius: .5, width: 1.1, walkRadius: 1.06, rise: .172, stepsPerTurn: 36, turns: 2 };
export const MATERIALS = [
  { name: "Warm buff terrazzo with worn grey grain", color: [.69,.645,.565], roughness: .8, metallic: 0, texture: "stone.webp" },
  { name: "Blue-black painted wrought iron", color: [.085,.10,.115], roughness: .4, metallic: .58, texture: "" },
  { name: "Aged honey-brown polished wood", color: [.49,.315,.145], roughness: .32, metallic: 0, texture: "wood.webp" },
  { name: "Mottled warm limestone plaster", color: [.73,.655,.545], roughness: .95, metallic: 0, texture: "plaster.webp" },
  { name: "Historic midnight-blue skirting", color: [.035,.055,.19], roughness: .62, metallic: .08, texture: "" },
  { name: "Frosted oval window", color: [.82,.9,.89], roughness: .65, metallic: 0, texture: "", emissive: true },
  { name: "Rooms wall photograph", color: [1,1,1], roughness: .8, metallic: 0, texture: "journey-rooms.webp", poster: true },
  { name: "Private spa wall photograph", color: [1,1,1], roughness: .8, metallic: 0, texture: "journey-spa.webp", poster: true },
  { name: "Restaurant wall photograph", color: [1,1,1], roughness: .8, metallic: 0, texture: "journey-restaurant.webp", poster: true },
  { name: "Aged brass picture frames", color: [.48,.34,.17], roughness: .4, metallic: .72, texture: "" },
] as const;

export const JOURNEY_STATIONS = [
  {id:"sobe",turn:.78,start:.24,end:.38,progress:.31,material:6,photoAspect:3/2},
  {id:"spa",turn:1.17,start:.51,end:.64,progress:.575,material:7,photoAspect:16/9},
  {id:"restoran",turn:1.47,start:.77,end:.90,progress:.835,material:8,photoAspect:3/2},
] as const;
export const POSTER_LAYOUT={width:600,height:800,photoBox:{left:20,top:90,width:560,height:480}};

export function posterPhotoBounds(aspect:number){
 const box=POSTER_LAYOUT.photoBox,width=Math.min(box.width,Math.round(box.height*aspect)),height=Math.min(box.height,Math.round(box.width/aspect));
 return {left:box.left+Math.floor((box.width-width)/2),top:box.top+Math.floor((box.height-height)/2),width,height};
}

const add = (a:Vec3,b:Vec3):Vec3 => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub = (a:Vec3,b:Vec3):Vec3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul = (a:Vec3,n:number):Vec3 => [a[0]*n,a[1]*n,a[2]*n];
const cross = (a:Vec3,b:Vec3):Vec3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm = (a:Vec3):Vec3 => mul(a,1/(Math.hypot(...a)||1));

export function posterPose(turn:number){
 const center=stairPoint(turn,1.53,1.43),normal=norm([Math.max(-STAIR.halfStraight,Math.min(STAIR.halfStraight,center[0]))-center[0],0,-center[2]]);
 return {center,normal,tangent:norm(cross([0,1,0],normal))};
}

export function posterViewCorners(station:typeof JOURNEY_STATIONS[number],photoOnly:boolean):Vec3[]{
 const pose=posterPose(station.turn),photo=posterPhotoBounds(station.photoAspect);
 const xs=photoOnly?[(photo.left/600-.5)*.78,((photo.left+photo.width)/600-.5)*.78]:[-.425,.425];
 const ys=photoOnly?[(.5-photo.top/800)*1.04,(.5-(photo.top+photo.height)/800)*1.04]:[.555,-.555];
 return xs.flatMap(x=>ys.map(y=>add(pose.center,add(mul(pose.tangent,x),add([0,y,0],mul(pose.normal,.012))))));
}

export type StairFocus={station:typeof JOURNEY_STATIONS[number];weight:number;eye:Vec3;target:Vec3};

/** Same arc-length parameter on every concentric capsule; smooth walking speed. */
export function stairPoint(turn:number,radius:number,height=0):Vec3 {
  const l=STAIR.halfStraight, r=STAIR.walkRadius, perimeter=4*l+2*Math.PI*r;
  let d=((turn%1)+1)%1*perimeter, x:number,z:number;
  if(d<2*l){x=l-d;z=radius}
  else if((d-=2*l)<Math.PI*r){const a=Math.PI/2+d/r;x=-l+Math.cos(a)*radius;z=Math.sin(a)*radius}
  else if((d-=Math.PI*r)<2*l){x=-l+d;z=-radius}
  else{d-=2*l;const a=-Math.PI/2+d/r;x=l+Math.cos(a)*radius;z=Math.sin(a)*radius}
  return [x,turn*STAIR.stepsPerTurn*STAIR.rise+height,z];
}

class Builder {
  v:number[]=[];i:number[]=[];
  vertex(p:Vec3,n:Vec3,uv:[number,number],shade=1){const index=this.v.length/9;this.v.push(...p,...n,...uv,shade);return index}
  quad(a:Vec3,b:Vec3,c:Vec3,d:Vec3,shade=1,uv?:[number,number][]){
    const n=norm(cross(sub(b,a),sub(c,a))),points=[a,b,c,d];
    const ids=points.map((p,j)=>this.vertex(p,n,uv?.[j]??(Math.abs(n[1])>.5?[p[0]*2.4,p[2]*2.4]:Math.abs(n[0])>Math.abs(n[2])?[p[2]*2.4,p[1]*2.4]:[p[0]*2.4,p[1]*2.4]),shade));
    this.i.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);
  }
  box(center:Vec3,size:Vec3,shade=1){
    const [x,y,z]=center,[a,b,c]=size.map(v=>v/2),p:Vec3[]=[[-a,-b,-c],[a,-b,-c],[a,b,-c],[-a,b,-c],[-a,-b,c],[a,-b,c],[a,b,c],[-a,b,c]].map(v=>[v[0]+x,v[1]+y,v[2]+z] as Vec3);
    for(const f of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])this.quad(p[f[0]],p[f[1]],p[f[2]],p[f[3]],shade);
  }
  /** Swept oval or rectangular profile: wood is flattened, iron is square. */
  sweep(points:Vec3[],width:number,height:number,sides=8,shade=1,planeNormal?:Vec3){
    const rings:number[][]=[];
    for(let j=0;j<points.length;j++){
      const tangent=norm(sub(points[Math.min(j+1,points.length-1)],points[Math.max(0,j-1)]));
      let side=norm(cross(tangent,planeNormal??[0,1,0]));if(Math.hypot(...side)<.1)side=[1,0,0];
      const up=norm(cross(side,tangent)),ring:number[]=[];
      for(let k=0;k<sides;k++){
        const a=k/sides*Math.PI*2+(sides===4?Math.PI/4:0),n=norm(add(mul(side,Math.cos(a)),mul(up,Math.sin(a))));
        const p=add(points[j],add(mul(side,Math.cos(a)*width),mul(up,Math.sin(a)*height)));
        ring.push(this.vertex(p,n,[j/(points.length-1)*12,k/sides],shade));
      }rings.push(ring);
    }
    for(let j=0;j<rings.length-1;j++)for(let k=0;k<sides;k++){const k1=(k+1)%sides,a=rings[j][k],b=rings[j+1][k],c=rings[j+1][k1],d=rings[j][k1];this.i.push(a,b,c,a,c,d)}
  }
  mesh(name:string,material:number,castsShadow=true):StairMesh{return {name,material,castsShadow,vertices:new Float32Array(this.v),indices:new Uint32Array(this.i)}}
}

export function createStaircaseModel():StairMesh[] {
  const stone=new Builder(),iron=new Builder(),wood=new Builder(),plaster=new Builder(),skirt=new Builder(),glass=new Builder();
  const {innerRadius:ri,width,rise,stepsPerTurn:count,turns}=STAIR,ro=ri+width,total=count*turns;
  for(let step=0;step<total;step++){
    const y=step*rise,shade=.96+.035*Math.sin(step*2.17),start=step/count,end=(step+1)/count;
    // Curved fan treads, risers, exposed undersides, and a small worn nosing.
    for(let j=0;j<4;j++){
      const a=start+(end-start)*j/4,b=start+(end-start)*(j+1)/4;
      const ai=stairPoint(a,ri),ao=stairPoint(a,ro),bi=stairPoint(b,ri),bo=stairPoint(b,ro);
      for(const p of [ai,ao,bi,bo])p[1]=y;
      stone.quad(ai,bi,bo,ao,shade);
      stone.quad([ai[0],y-.21,ai[2]],[ao[0],y-.21,ao[2]],[bo[0],y-.21,bo[2]],[bi[0],y-.21,bi[2]],shade*.77);
      stone.quad(ai,[ai[0],y-.21,ai[2]],[bi[0],y-.21,bi[2]],bi,shade*.91);
      stone.quad(ao,bo,[bo[0],y-.21,bo[2]],[ao[0],y-.21,ao[2]],shade*.92);
    }
    const a=stairPoint(start,ri),b=stairPoint(start,ro),c=stairPoint(end,ri),d=stairPoint(end,ro);
    stone.quad([a[0],y-.018,a[2]],[b[0],y-.018,b[2]],[b[0],y-.21,b[2]],[a[0],y-.21,a[2]],shade*.84);
    stone.quad([c[0],y,c[2]],[c[0],y-.21,c[2]],[d[0],y-.21,d[2]],[d[0],y,d[2]],shade*.87);
    const nose=Array.from({length:7},(_,j)=>{const p=stairPoint(start,ri+width*j/6);p[1]=y-.012;return p});
    stone.sweep(nose,.017,.014,6,shade*1.02);
    // Square painted-iron balusters and stepped cast post shoes.
    const post=stairPoint((step+.48)/count,ri+.035);post[1]=y+.48;
    const heavy=step%6===0;iron.box(post,[heavy?.036:.019,.92,heavy?.036:.019],heavy?1:.92);
    if(heavy){iron.box([post[0],y+.035,post[2]],[.105,.07,.105]);iron.box([post[0],y+.083,post[2]],[.068,.04,.068])}
  }
  const railSteps=turns*300;
  const rail=(radius:number,height:number)=>Array.from({length:railSteps+1},(_,j)=>stairPoint(j/railSteps*turns,radius,height));
  wood.sweep(rail(ri+.035,.96),.036,.024,12);
  for(const h of [.16,.75,.89])iron.sweep(rail(ri+.035,h),.014,.012,4,.95);
  // The paired leaf / oval ornaments are the recognisable forged-iron detail.
  for(let step=3;step<total-2;step+=6){
    for(const sign of [-1,1]){
      const points=Array.from({length:33},(_,j)=>{
        const a=j/32*Math.PI*2,turn=(step+sign*.48+Math.sin(a)*.50)/count;
        return stairPoint(turn,ri+.035,.48+Math.cos(a)*.27);
      });const center=stairPoint(step/count,ri),radial=norm([center[0]-Math.max(-STAIR.halfStraight,Math.min(STAIR.halfStraight,center[0])),0,center[2]]);iron.sweep(points,.014,.010,4,1,radial);
    }
  }
  // Continuous soffit ribbons support the exposed stone, never a floating spiral.
  for(let step=0;step<total*3;step++){
    const a=step/(count*3),b=(step+1)/(count*3);
    const ai=stairPoint(a,ri+.005,-.26),bi=stairPoint(b,ri+.005,-.26),ao=stairPoint(a,ro,-.26),bo=stairPoint(b,ro,-.26);
    plaster.quad(ai,bi,bo,ao,.88);
    const at=stairPoint(a,ro+.015,.10),bt=stairPoint(b,ro+.015,.10),ab=stairPoint(a,ro+.015,.36),bb=stairPoint(b,ro+.015,.36);
    skirt.quad(at,bt,bb,ab,.9);
  }
  // Ivory stairwell enclosure. A generous top opening admits daylight.
  const wallRadius=ro+.10,wallTop=total*rise+2.4;
  for(let j=0;j<180;j++){
    const a=stairPoint(j/180,wallRadius),b=stairPoint((j+1)/180,wallRadius);
    const normal=(p:Vec3):Vec3=>norm([Math.max(-STAIR.halfStraight,Math.min(STAIR.halfStraight,p[0]))-p[0],0,-p[2]]);
    const na=normal(a),nb=normal(b),ids=[plaster.vertex([a[0],-.4,a[2]],na,[j/180*8,-.4],.98),plaster.vertex([b[0],-.4,b[2]],nb,[(j+1)/180*8,-.4],.98),plaster.vertex([b[0],wallTop,b[2]],nb,[(j+1)/180*8,wallTop],.98),plaster.vertex([a[0],wallTop,a[2]],na,[j/180*8,wallTop],.98)];
    plaster.i.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);
  }
  plaster.quad([-4,-.4,-3],[-4,-.4,3],[4,-.4,3],[4,-.4,-3],.8);
  // Frosted oval windows, warm stone reveal and original black petal ironwork.
  for(let floor=0;floor<4;floor++){
    const centerY=floor*(count*rise/2)+1.8,z=-wallRadius+.012,rx=.47,ry=.88;
    const rim:Vec3[]=Array.from({length:65},(_,j)=>{const a=j/64*Math.PI*2;return [Math.sin(a)*rx,centerY+Math.cos(a)*ry,z]});
    for(let j=0;j<64;j++){
      const a=rim[j],b=rim[j+1],c:Vec3=[0,centerY,z+.002],n:Vec3=[0,0,1];
      const ids=[glass.vertex(a,n,[a[0],a[1]]),glass.vertex(b,n,[b[0],b[1]]),glass.vertex(c,n,[0,0])];glass.i.push(...ids);
    }
    plaster.sweep(rim.map(p=>[p[0],p[1],p[2]+.022]),.065,.045,10,1,[0,0,1]);
    iron.sweep(rim.map(p=>[p[0]*.965,centerY+(p[1]-centerY)*.965,z+.055]),.017,.017,6,1,[0,0,1]);
    iron.sweep([[0,centerY-ry,z+.065],[0,centerY+ry,z+.065]],.012,.012,4);
    for(const sign of [-1,1]){
      const petal:Vec3[]=Array.from({length:33},(_,j)=>{const a=j/32*Math.PI*2;return [Math.sin(a)*.30,centerY+sign*.32+Math.cos(a)*.42,z+.068]});iron.sweep(petal,.014,.012,4,1,[0,0,1]);
    }
  }
  const frames=new Builder(),posters:StairMesh[]=[];
  for(const station of JOURNEY_STATIONS){
    const {center,normal,tangent}=posterPose(station.turn),print=new Builder();
    const point=(x:number,y:number,depth=0)=>add(center,add(mul(tangent,x),add([0,y,0],mul(normal,depth))));
    print.quad(point(-.39,-.52,.012),point(.39,-.52,.012),point(.39,.52,.012),point(-.39,.52,.012),1,[[0,0],[1,0],[1,1],[0,1]]);
    for(const [a,b,c,d]of [
      [[-.425,-.555],[.425,-.555],[.39,-.52],[-.39,-.52]],
      [[-.39,.52],[.39,.52],[.425,.555],[-.425,.555]],
      [[-.425,-.555],[-.39,-.52],[-.39,.52],[-.425,.555]],
      [[.39,-.52],[.425,-.555],[.425,.555],[.39,.52]],
    ])frames.quad(point(a[0],a[1],.025),point(b[0],b[1],.025),point(c[0],c[1],.025),point(d[0],d[1],.025));
    posters.push(print.mesh(station.id+" framed wall offer",station.material,false));
  }
  return [stone.mesh("Carved terrazzo treads and nosings",0),iron.mesh("Wrought iron balusters and paired leaf ornaments",1),wood.mesh("Continuous flattened amber handrail",2),plaster.mesh("Ivory walls and supporting soffit",3,false),skirt.mesh("Blue-black wall skirting",4,false),glass.mesh("Oval frosted windows",5,false),...posters,frames.mesh("Brass wall display frames",9)];
}

export function staircaseCamera(progress:number,_mobile:boolean):{eye:Vec3;target:Vec3;focus:StairFocus|null} {
  const p=Math.max(0,Math.min(1,progress)),entry=Math.min(1,p/.20),approach=entry*entry*(3-2*entry);
  const stops=[[0,.58],[.12,.58],[.24,.78],[.38,.78],[.51,1.17],[.64,1.17],[.77,1.47],[.90,1.47],[1,1.65]];
  const index=Math.max(0,stops.findIndex((stop,i)=>i<stops.length-1&&p>=stop[0]&&p<=stops[i+1][0]));
  const a=stops[index],b=stops[index+1],fraction=Math.min(1,Math.max(0,(p-a[0])/(b[0]-a[0]))),s=fraction*fraction*(3-2*fraction),walk=a[1]+(b[1]-a[1])*s;
  // Enter on the walking line, then climb toward each display. No cut through the inner rail.
  const cameraTurn=walk-.06*(1-approach);
  let eye=stairPoint(cameraTurn,STAIR.walkRadius,1.6),target=stairPoint(cameraTurn+.13+.04*(1-approach),STAIR.walkRadius-.16,.45+.27*(1-approach));
  let focus:StairFocus|null=null;
  const smooth=(lo:number,hi:number)=>{const x=Math.min(1,Math.max(0,(p-lo)/(hi-lo)));return x*x*(3-2*x)};
  for(const station of JOURNEY_STATIONS){
    const weight=smooth(station.start-.055,station.start)*(1-smooth(station.end,station.end+.055));if(!weight)continue;
    const pose=posterPose(station.turn),focusEye=stairPoint(station.turn,.84,1.60),focusTarget:Vec3=[pose.center[0],focusEye[1],pose.center[2]];
    focus={station,weight,eye:focusEye,target:focusTarget};
    eye=eye.map((v,i)=>v+(focusEye[i]-v)*weight) as Vec3;target=target.map((v,i)=>v+(focusTarget[i]-v)*weight) as Vec3;
  }
  return {eye,target,focus};
}
