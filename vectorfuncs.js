
// https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix
const FLOATING_POINT_ACCURACY = 1.0e-10
const X = 0
const Y = 1
const Z = 2
// vec2 functions
const equal2=(Va,Vb)=>0.001>dist_sqr2(Va,Vb);
const scale2=(V,b)=>[V[0]*b,V[1]*b];
const add2=(Va,Vb)=>[Va[0]+Vb[0],Va[1]+Vb[1]];
const sub2=(Va,Vb)=>[Va[0]-Vb[0],Va[1]-Vb[1]];
const dot2=(Va,Vb)=>Va[0]*Vb[0]+Va[1]*Vb[1];
const dist_sqr2=(a,b)=>(a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]);
const len2=(a)=>Math.sqrt(dot2(a,a));
const normalize2=(a)=>scale2(a,1/len2(a));
const segment_intersect2=(a,b,d,c)=>{
    const e=(c[1]-d[1])*(b[0]-a[0])-(c[0]-d[0])*(b[1]-a[1]);
    if(0==e)return false;
    c=((c[0]-d[0])*(a[1]-d[1])-(c[1]-d[1])*(a[0]-d[0]))/e;
    d=((b[0]-a[0])*(a[1]-d[1])-(b[1]-a[1])*(a[0]-d[0]))/e;
    return 0<=c&&1>=c&&0<=d&&1>=d?[a[0]+c*(b[0]-a[0]),a[1]+c*(b[1]-a[1])]:false;
}
const transform2=(v,M)=>{
    const d=new Array(2);
    d[0] = v[0] * M[0] + v[1] * M[2]
    d[1] = v[0] * M[1] + v[1] * M[3]
    return d;
}
// vec3 functions
const scale3=(v,b)=>[v[0]*b,v[1]*b,v[2]*b];
const len3=(a)=>Math.sqrt(dot3(a,a));
const normalize3=(a)=>scale3(a,1/len3(a));
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const transform3=(v,M)=>{
    const d=new Array(3);
    for(c=0;c<3;c++) d[c]=(M[c]*v[0]+M[c+3]*v[1]+M[c+6]*v[2]);
    return d;
}
const multiply3m=(a,b)=>{
    const d=new Float32Array(9);
    for(let c=0;9>c;c+=3)
        for(let e=0;3>e;e++)
            d[c+e]=b[c+0]*a[0+e]+b[c+1]*a[3+e]+b[c+2]*a[6+e];
    return d;
}// vec4 functions
const add4=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3]];
const transform4=(v,M)=>{
    const d=new Float32Array(3);
    let c = 3
    w =M[c]*v[0]+M[c+4]*v[1]+M[c+8]*v[2]+M[c+12]
    for(c=0;c<3;c++) d[c]=(M[c]*v[0]+M[c+4]*v[1]+M[c+8]*v[2]+M[c+12])/w;
    return d;
}
// const transform4=(v,M)=>{
//     const d=new Float32Array(4);
//     for(let c=0;4>c;c++)d[c]=M[c]*v[0]+M[c+4]*v[1]+M[c+8]*v[2]+M[c+12];
//     return d;
// }
// mat4 functions
const lookAt4m=(a,b,d)=>{ // pos, lookAt, up
    const c=new Float32Array(16);
    b=normalize3(sub3(a,b));
    d=normalize3(cross3(d,b));
    const e=normalize3(cross3(b,d));
    c[0]=d[0];c[1]=e[0];c[2]=b[0];c[3]=0;
    c[4]=d[1];c[5]=e[1];c[6]=b[1];c[7]=0;
    c[8]=d[2];c[9]=e[2];c[10]=b[2];c[11]=0;
    c[12]=-(d[0]*a[0]+d[1]*a[1]+d[2]*a[2]);
    c[13]=-(e[0]*a[0]+e[1]*a[1]+e[2]*a[2]);
    c[14]=-(b[0]*a[0]+b[1]*a[1]+b[2]*a[2]);
    c[15]=1;
    return c;
}
const multiply4m=(a,b)=>{
    const d=new Float32Array(16);
    for(let c=0;16>c;c+=4)
        for(let e=0;4>e;e++)
            d[c+e]=b[c+0]*a[0+e]+b[c+1]*a[4+e]+b[c+2]*a[8+e]+b[c+3]*a[12+e];
    return d;
}
const perspective4m=(a,b)=>{ // fovy, aspect
    const c=(new Float32Array(16)).fill(0,0);
    c[5]=1/Math.tan(a/2);
    c[0]=c[5]/b;
    c[10]=c[11]=-1;
    return c;
}
 /** -----------------------------------------------------------------
   * Set a perspective projection matrix based on limits of a frustum.
   * @param left   Number Farthest left on the x-axis
   * @param right  Number Farthest right on the x-axis
   * @param bottom Number Farthest down on the y-axis
   * @param top    Number Farthest up on the y-axis
   * @param near   Number Distance to the near clipping plane along the -Z axis
   * @param far    Number Distance to the far clipping plane along the -Z axis
   * @return Float32Array A perspective transformation matrix
   */
  const createFrustum =(left, right, bottom, top, near, far)=> {
    // http://learnwebgl.brown37.net/transformations2/matrix_library_introduction.html
    // https://learnwebgl.brown37.net/08_projections/projections_perspective.html
    let M = Array(16)
    let sx = 2 * near / (right - left);
    let sy = 2 * near / (top - bottom);
    let c1 = 2 * near * far / (near - far);
    let c2 = - (far + near) / (far - near);
    let tx = -near * (left + right) / (right - left);
    let ty = -near * (bottom + top) / (top - bottom);
    M[0] = sx; M[4] = 0;  M[8] = 0;    M[12] = tx;
    M[1] = 0;  M[5] = sy; M[9] = 0;    M[13] = ty;
    M[2] = 0;  M[6] = 0;  M[10] = c2;  M[14] = c1;
    M[3] = 0;  M[7] = 0;  M[11] = -1;  M[15] = 0;
    return M;
  }
const createPerspectiveUsingFrustum=(fovy, aspect, near, far)=>{
    // https://www.scratchapixel.com/code.php?id=4&origin=/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix
    // https://learnwebgl.brown37.net/08_projections/projections_perspective.html
    let top, bottom, left, right;
    top = near * Math.tan((fovy*(Math.PI/180))/2);
    bottom = -top;
    right = top * aspect;
    left = -right;
    return createFrustum(left, right, bottom, top, near, far);
  }
const center2dscreen=(x,y,w,h,v4)=> {
    const d=new Float32Array(2);
    d[X]=x+w/2+v4[X]
    d[Y]=y+h/2-v4[Y]
    return d
}
const unitm=(n)=>{
    const d=new Float32Array(n*n).fill(0,0)
    for(let i=0; i<n; i++) d[i*n]=1
    return d
}
const centerv3=(a,b,c)=>{
    const d = Array(3)
    for (let i=0;i<3;i++) d[i]=(a[i]+b[i]+c[i])/3
    return d
}
const normal3=(v1,v2,v3)=>{
    let s = sub3(v2, v1)
    let t = sub3(v3, v2)
    let c = cross3(s,t )
    let n = normalize3(c)
    return n
}
const triangleArea2=(p1,p2,p3)=>{
    return Math.abs((p1[X]*(p2[Y]-p3[Y]) + p2[X]*(p3[Y]-p1[Y])+ p3[X]*(p1[Y]-p2[Y]))/2.0);    
}
const insideTriangle=(p1,p2,p3,p)=>{
    let area = triangleArea2(p1,p2,p3)
    let arear = triangleArea2(p,p2,p3) + triangleArea2(p1,p,p3)+triangleArea2(p1,p2,p)
    return (arear - area) <= FLOATING_POINT_ACCURACY
}
const rot2=(phi)=>{  // https://en.wikipedia.org/wiki/Rotation_matrix
    let R = new Array(4)
    R[0] = Math.cos(phi)
    R[1] = -Math.sin(phi)
    R[2] = -R[1]
    R[3] = R[0]
    return R
}
const rot3x=(phi)=>{  // https://en.wikipedia.org/wiki/Rotation_matrix
    let R = new Array(9).fill(0)
    R[0] = 1
    R[4] = Math.cos(phi)
    R[5] = -Math.sin(phi)
    R[7] = -R[5]
    R[8] = R[4]
    return R
}
const rot3y=(phi)=>{  // https://en.wikipedia.org/wiki/Rotation_matrix
    let R = new Array(9).fill(0)
    R[4] = 1
    R[8] = Math.cos(phi)
    R[6] = -Math.sin(phi)
    R[2] = -R[6]
    R[0] = R[8]
    return R
}
const rot3z=(phi)=>{  // https://en.wikipedia.org/wiki/Rotation_matrix
    let R = new Array(9).fill(0)
    R[8] = 1
    R[0] = Math.cos(phi)
    R[1] = -Math.sin(phi)
    R[3] = -R[1]
    R[4] = R[0]
    return R
}
const rot3=(phix, phiy, phiz)=>{
    mx = rot3x(phix)
    my = rot3y(phiy)
    mz = rot3z(phiz)
    return multiply3m(mz,multiply3m(my, mx))
}

const shuffle=(A)=> {
    for (let i = 0; i < A.length - 1; i ++) {
        let j = Math.floor( Math.random() * A.length )
        let t = A[i]
        A[i] = A[j]
        A[j] = t
    }
    return A
}
const stringDex=(V) => {
    let str = ''
    for (e of V) {
        str += e.toString() + '_'
    }
    return str.slice(0,-1)
}