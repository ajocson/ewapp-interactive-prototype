// Adapted from FeralUI's public export, https://feralui.dev/react-gradient/runtime.jsx
// (2026-09-24): Flow q1/un/jt. Matches the live preview's sRGB mixing.
export const FLOW_VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`;
export const FLOW_FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec3 colors[4];
uniform vec2 spots[4];
float ease(float x){x=clamp(x,0.0,1.0);return x*x*(3.0-2.0*x);}
vec2 orbit(float i,float t){
  float phase=i*0.37;
  return vec2(0.5+0.5*sin(t*(0.6+fract(i/3.0)*0.9)+phase),
              0.5+0.5*cos(t*(0.8+fract((i+1.0)/4.0))+phase*1.5));
}
void main(){
  // Scale 50 -> zoom 1.0; distortion 60%; swirl 10%.
  vec2 p=vec2(gl_FragCoord.x/resolution.x,1.0-gl_FragCoord.y/resolution.y);
  float edge=ease(length(p-0.5));
  for(int pass=1;pass<=2;pass++){
    float step=float(pass);
    p.x+=0.6*(1.0-edge)/step*sin(time+step*0.4*ease(p.y))*cos(0.2*time+step*2.4*ease(p.y));
    p.y+=0.6*(1.0-edge)/step*cos(time+step*2.0*ease(p.x));
  }
  float angle=-0.3*edge;
  vec2 d=p-0.5;
  p=vec2(cos(angle)*d.x-sin(angle)*d.y,sin(angle)*d.x+cos(angle)*d.y)+0.5;
  vec3 color=vec3(0.0);float total=0.0;
  for(int i=0;i<4;i++){
    vec2 spot=spots[i]+0.2*(orbit(float(i),time)-orbit(float(i),20.75));
    vec2 delta=p-spot;
    float squared=dot(delta,delta);
    // Equal 25% divider bands give each spot weight 1.
    float weight=1.0/(squared*squared+0.0001);
    color+=colors[i]*weight;total+=weight;
  }
  gl_FragColor=vec4(color/max(0.0001,total),1.0);
}`;
