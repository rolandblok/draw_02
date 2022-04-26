//little script using processing.
var uniqueID = (function() {
  var id = 0; // This is the private persistent value
  // The outer function returns a nested function that has access
  // to the persistent value.  It is this nested function we're storing
  // in the variable uniqueID above.
  return function() { return id++; };  // Return and increment
})(); // Invoke the outer function after defining it.


// var stats = new Stats();
// document.body.appendChild(this.stats.dom);
// stats.showPanel(0)  // 0: fps, 1: ms, 2: mb, 3+: custom

var gui = new dat.GUI();
var settings = []
settings.draw_modes  = ['TEMPLEET', 'salesman', 'man_draw']
settings.draw_mode = settings.draw_modes[settings.draw_modes.length-1]
// settings.draw_mode = settings.draw_modes[0]
gui.add(settings, 'draw_mode', settings.draw_modes).onChange(function(v){set_draw_mode()})
settings.invert_color = false
gui.add(settings, 'invert_color').onChange(function (v) { cvs.draw() })
settings.kader = false
gui.add(settings, 'kader').onChange(function (v) { cvs.draw() })
settings.square = true
gui.add(settings, 'square').onChange(function (v) { cvs.draw() })
settings.aspect = 0.65
gui.add(settings, 'aspect').step(.01).min(0.5).max(1.5).onChange(function (v) { cvs.draw() })
settings.grid_edge = 2
settings.grid_x = 1
gui.add(settings, 'grid_x').step(1).min(1).max(10).onChange(function (v) { cvs.draw() })
settings.grid_y = 1
gui.add(settings, 'grid_y').step(1).min(1).max(10).onChange(function (v) { cvs.draw() })
settings.grid_edge = 10
gui.add(settings, 'grid_edge').step(1).min(1).onChange(function (v) { cvs.draw() })
settings.regrid=()=> {
  console.log("regrid")
  set_draw_mode()
}
gui.add(settings, 'regrid')

var setup_done = false

dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
}

addEventListener("resize", this.resize, false);
window.addEventListener("focus", function(event) { console.log( "window has focus"); paused = false }, false);
window.addEventListener("blur", function(event) { console.log( "window lost focus");paused = true }, false);


settings.downloadSvg=()=> {
  console.log("save")
  svg.save_canvas()
}

settings.invert = false
gui.add(settings, 'downloadSvg')
settings.no_vertices = 0
gui.add(settings, 'no_vertices').listen()

let sketch = function(p) {
  p.setup = function () {
    // createCanvas(400,400)
    if (p.type === "SCREEN") {
      canvas = p.createCanvas(window.innerWidth, window.innerHeight)
    } else if (p.type === "SVG") {
      canvas_SVG = p.createCanvas(window.innerWidth, window.innerHeight, p.SVG)
    }
    // https://github.com/zenozeng/p5.js-svg/
    // https://makeyourownalgorithmicart.blogspot.com/2018/03/creating-svg-with-p5js.html
    // https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
    
    p.noLoop();

    set_draw_mode()
    setup_done = true
  }

  p.draw = function () {
    if (!setup_done) return
    

    if (current_drawers != 0) {

      if (settings.invert_color) {
        fgc = [255,255,255]
        bgc = [0,0,0]
      } else {
        fgc = [0,0,0]
        bgc = [255,255,255]
      }
      settings.no_vertices = current_drawers.draw(p, fgc=fgc, bgc=bgc)
    }
  }

  p.save_canvas = function() {
    if (p.type === "SVG") {
      console.log("save")
      p.draw()
      p.save()
    }
  }
  p.keyPressed = function(event) {
    console.log("key " + event.key)
    if (event.key === 'p') {
      console.log('p')
    } else if (event.key === '=') {
      current_drawers.draw_plus()
    } else if (event.key === '-') {
      current_drawers.draw_min()
    } else {
      current_drawers.key(event.key)
    }
  }
  p.mouseDragged = function(event) {
    console.log("mouseDragged " + p.mouseButton + " " + event.clientX + " " + event.clientY)
    current_drawers.mouseDragged(this, event.clientX, event.clientY)

  } 
  p.mousePressed = function(event) {
    // console.log("mousePressed " + event.button + " " + event.clientX + " " + event.clientY)
    current_drawers.mousePressed(this, event.clientX, event.clientY)
  }
  p.mouseWheel = function(event) {
    current_drawers.mousewheel(this, event.clientX, event.clientY, event.delta / 100)

  }
  p.mouseMoved = function(event) {
    current_drawers.mouseMoved(this, event.clientX, event.clientY)
  }
  p.mouseClicked = function(event) {
    if (p.type !== "SVG") {
      current_drawers.mouseClicked(this, event.clientX, event.clientY)
    }
  }
  p.mouse = function(event) {
    current_drawers.mouse(this, event.clientX, event.clientY)
  }
  
  

}

var cvs = new p5(sketch, "canvas" )
cvs.type = "SCREEN"
var svg = new p5(sketch, "hidden_div")
svg.type = "SVG"


var current_drawers = 0
function set_draw_mode() {
  if(current_drawers != 0) {
    current_drawers.close()
  }
  current_drawers = new DrawerSet(settings.grid_x, settings.grid_y)

  cvs.draw()
}


/**
 * drawer store
 */
class DrawerSet {
  constructor (Nx, Ny) {
    this.drawers = Array(Nx)
    for (let xi = 0; xi < Nx; xi ++) {
      this.drawers[xi] = Array(Ny)
      for (let yi = 0; yi < Ny; yi ++) {
        let xywh = this.calc_xywh(Nx,Ny,xi, yi )
        this.add_drawer(xywh, xi, yi)
      }
    }
  }

  calc_xywh(Nx,Ny, xi,yi) {
    let xywh = {}
    let W = window.innerHeight
    let H = window.innerHeight
    if (!settings.square) {
      W = H * settings.aspect
    }
    let D = settings.grid_edge
    let w = (W - (Nx + 1)*D) / Nx
    let h = (H - (Ny + 1)*D) / Ny
    let x = (D + w) * xi + D
    let y = (D + h) * yi + D
    xywh['x'] = x
    xywh['y'] = y
    xywh['w'] = w
    xywh['h'] = h
    return xywh
  }

  add_drawer(xywh, xi, yi) {
    let current_drawer = 0
    let gui_string = " " + xi +"_" + yi
    if (settings.draw_mode == 'TEMPLEET') {
      current_drawer = new TEMPLEET(gui, xywh, gui_string)
    } else if (settings.draw_mode == 'salesman'){
      current_drawer = new salesman(gui, xywh, gui_string)
    } else if (settings.draw_mode == 'man_draw'){
      current_drawer = new ManDraw(gui, xywh, gui_string)
    }
    
    
    
    this.drawers[xi][yi] = current_drawer
  }

  draw(p, fgc = [0,0,0], bgc = [255,255,255]) {
    let xywh =  this.calc_xywh(1,1, 0, 0)
    p.clear()
    if (settings.kader) {
      p.stroke(fgc)
      p.rect( xywh.x,  xywh.y,  xywh.w,  xywh.h)
    }
    let no_vertices = 0
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        no_vertices += drawer.draw(p,fgc, bgc)
      }
    }
    return no_vertices
  }

  close() {
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.close()
      }
    }
  }
  draw_min() {
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.draw_min()
      }
    }
    cvs.draw()
  }
  draw_plus() {
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.draw_plus()
      }
    }
    cvs.draw()
  }
  mouse(p,x,y) {
    console.log("draw_02 mouse")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mouse(p,x,y)
      }
    }
  }
  
  mousewheel(p, x, y, count) {
    console.log("draw_02 mouwheel")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mousewheel(p,x,y, count)
      }
    }
  }
  mouseMoved(p, x,y) {
    console.log("draw_02 mouseMoved")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mouseMoved(p,x,y)
      }
    }
  }
  mouseClicked(p, x,y) {
    console.log("draw_02 mouseClicked")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mouseClicked(p,x,y)
      }
    }
  }
  mousePressed(p, x,y) {
    console.log("draw_02 mouseClicked")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mousePressed(p,x,y)
      }
    }
  }
  mouseDragged(p, x,y) {
    console.log("draw_02 mouseDragged")
    if (x > window.innerHeight) return
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.mouseDragged(p,x,y)
      }
    }
  }


  key(key) {
    for(let y_drawers of this.drawers) {
      for(let drawer of y_drawers) {
        drawer.key(key)
      }
    }    
  }
  }



// =================
// ===MOUSE n KEYS=======
// =================



function resize() {
  console.log("resize")
  cvs.resizeCanvas(window.innerWidth, window.innerHeight)
  cvs.draw()

}
