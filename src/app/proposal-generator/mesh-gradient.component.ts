import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { FLOW_FRAGMENT, FLOW_VERTEX } from './flow-gradient.shader';

@Component({
  selector: 'app-mesh-gradient',
  standalone: true,
  templateUrl: './mesh-gradient.component.html',
  styleUrl: './mesh-gradient.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeshGradientComponent implements AfterViewInit, OnDestroy {
  @Input() mode: 'section' | 'banner' = 'section';
  @HostBinding('class.mesh-gradient--banner') get isBanner(): boolean { return this.mode === 'banner'; }
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('grain', { static: true }) private grain!: ElementRef<HTMLCanvasElement>;
  private readonly zone = inject(NgZone);
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private timeUniform: WebGLUniformLocation | null = null;
  private resolutionUniform: WebGLUniformLocation | null = null;
  private resize?: ResizeObserver;
  private intersection?: IntersectionObserver;
  private motion?: MediaQueryList;
  private frame = 0;
  private last = 0;
  private time = 20.75;
  private visible = true;
  private destroyed = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      const canvas = this.canvas.nativeElement;
      canvas.addEventListener('webglcontextlost', this.onLost);
      canvas.addEventListener('webglcontextrestored', this.onRestored);
      document.addEventListener('visibilitychange', this.sync);
      this.motion?.addEventListener('change', this.sync);
      window.addEventListener('resize', this.onResize);
      if (typeof ResizeObserver !== 'undefined') {
        this.resize = new ResizeObserver(this.onResize);
        this.resize.observe(canvas);
      }
      if (typeof IntersectionObserver !== 'undefined') {
        this.intersection = new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
          this.sync();
        });
        this.intersection.observe(canvas);
      }
      this.makeGrain();
      this.setup();
    });
  }

  private setup(): void {
    const canvas = this.canvas.nativeElement;
    const gl = this.gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    canvas.dataset['renderer'] = 'fallback';
    canvas.style.visibility = 'hidden';
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, FLOW_VERTEX], [gl.FRAGMENT_SHADER, FLOW_FRAGMENT]] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Cannot create gradient shader');
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed');
      }
      this.program = gl.createProgram();
      if (!this.program) throw new Error('Cannot create gradient program');
      shaders.forEach(shader => gl.attachShader(this.program!, shader));
      gl.bindAttribLocation(this.program, 0, 'position');
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program) ?? 'Shader linking failed');
      gl.useProgram(this.program);
      this.buffer = gl.createBuffer();
      if (!this.buffer) throw new Error('Cannot create gradient geometry');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3fv(gl.getUniformLocation(this.program, 'colors[0]'), new Float32Array([245,241,253,170,134,228,238,230,250,122,79,204].map(value => value/255)));
      // Pinned positions decoded from the user's FeralUI share URL.
      gl.uniform2fv(gl.getUniformLocation(this.program, 'spots[0]'), new Float32Array([.438,.03,.597,.132,.743,.359,.919,.917]));
      this.timeUniform = gl.getUniformLocation(this.program, 'time');
      this.resolutionUniform = gl.getUniformLocation(this.program, 'resolution');
      canvas.dataset['renderer'] = 'webgl-flow';
      canvas.style.visibility = 'visible';
      this.onResize();
      this.sync();
    } catch (error) {
      this.release();
      console.warn('Flow gradient fallback:', error);
    } finally {
      shaders.forEach(shader => gl.deleteShader(shader));
    }
  }

  private readonly onResize = (): void => {
    const canvas = this.canvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2, 1920/Math.max(1,rect.width));
    canvas.width = Math.max(1,Math.round(rect.width*ratio));
    canvas.height = Math.max(1,Math.round(rect.height*ratio));
    this.paint();
  };

  private paint(): void {
    const gl = this.gl;
    if (!gl || !this.program) return;
    gl.useProgram(this.program);
    gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    gl.uniform2f(this.resolutionUniform,gl.canvas.width,gl.canvas.height);
    gl.uniform1f(this.timeUniform,this.time);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  private readonly tick = (now: number): void => {
    this.frame = 0;
    if (this.last) this.time += Math.min(.05,(now-this.last)/1000)*.30*1.2;
    this.last = now;
    this.paint();
    this.frame = requestAnimationFrame(this.tick);
  };

  private readonly sync = (): void => {
    const active = !this.destroyed && this.program && this.visible && !document.hidden && !this.motion?.matches;
    if (!active) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.last = 0;
      this.paint();
    } else if (!this.frame) {
      this.last = 0;
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private makeGrain(): void {
    const canvas = this.grain.nativeElement;
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) return;
    const data = context.createImageData(256,256);
    for (let i=0;i<data.data.length;i+=4) {
      const value = Math.round((Math.random()+Math.random())*127.5);
      data.data[i] = data.data[i+1] = data.data[i+2] = value;
      data.data[i+3] = 255;
    }
    context.putImageData(data,0,0);
    canvas.parentElement!.style.setProperty('--flow-grain', `url(${canvas.toDataURL()})`);
  }

  private readonly onLost = (event: Event): void => {
    event.preventDefault();
    this.program = null;
    this.buffer = null;
    this.canvas.nativeElement.style.visibility = 'hidden';
    this.canvas.nativeElement.dataset['renderer'] = 'fallback';
    this.sync();
  };
  private readonly onRestored = (): void => this.setup();

  private release(): void {
    if (this.buffer) this.gl?.deleteBuffer(this.buffer);
    if (this.program) this.gl?.deleteProgram(this.program);
    this.buffer = null;
    this.program = null;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.sync();
    this.resize?.disconnect();
    this.intersection?.disconnect();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.sync);
    this.motion?.removeEventListener('change', this.sync);
    this.canvas.nativeElement.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.nativeElement.removeEventListener('webglcontextrestored', this.onRestored);
    this.release();
  }
}
