
/**
 * 
 */
 class salesman extends Drawer {

    constructor(gui, xywh, sub_gui = '') {
        let name = "Templeet"
        super(name, gui, xywh, sub_gui)

        this.setting1(false)



        this.gui_folder_draw_options.add(this, 'R1').onChange(function (v) { cvs.draw() }).min(10)
        this.gui_folder_draw_options.add(this, 'no_points').onChange(function (v) { cvs.draw() }).min(10)
        this.gui_folder_draw_options.add(this, 'no_iterations').listen()
        this.gui_folder_defaults.add(this, 'setting1')
        this.gui_folder_defaults.add(this, 'make_points')
        this.gui_folder_defaults.add(this, 'start_solve')
        this.gui_folder_defaults.add(this, 'converged').listen()

        this.gui_folder_defaults.open()
        this.gui_folder_draw_options.open()

    }
    
    setting1(redraw = true) {
        this.R1 = 10
        this.no_points = 10
        this.no_iterations = -1
        this.kader = false
        this.solving = false

        this.make_points(redraw)
        if (redraw) {
            cvs.draw()
        }


    }

    make_points(redraw = true) {
        
        this.my_points = []
        this.sort_indices = []
        for (let pi = 0; pi < this.no_points; pi++) {
            let p1 = new Array(2)
            p1.x = this.Left + Math.floor( Math.random() * (this.Right - this.Left))
            p1.y = this.Top + Math.floor( Math.random() * (this.Bottom - this.Top))
            let p2 = new Array(2)
            p2.x = p1.x + Math.random()*60
            p2.y = p1.y + Math.random()*60

            this.my_points.push(new MySalesDoublePoint(p1, p2))
            this.sort_indices.push(pi)
        }
        this.solving = false
        this.converged = false


        if (redraw) {
            cvs.draw()
        }

    }

    start_solve() {
        this.no_iterations=0
        this.solving = true
        this.salesman = new SalesManSolver(this.my_points)
        cvs.draw()
    }

    draw(p, fgc = [0,0,0], bgc = [255,255,255]) {
        super.draw(p ,fgc, bgc)

        let no_vertices = 0

        if (this.solving) {
            p.loop()
            let res = this.salesman.solve_sales(1-5e-7, 1e6 )
            this.sort_indices = this.salesman.getOptimalOrder()
            this.no_iterations += res
            if (this.salesman.converged) {
                p.noLoop()
                this.converged = true
                this.solving = false
            }
        }
        

        for (const si of this.sort_indices) {
            // p.circle(this.my_points[si].x, this.my_points[si].y, this.R1)
            this.my_points[si].draw(p)
        }
        p.stroke(255,50,50)
        for (let si = 1; si < (this.sort_indices.length); si++) {
            let s0 = this.sort_indices[si-1]
            let s1 = this.sort_indices[si]
            p.beginShape()
            p.vertex(this.my_points[s0].p2.x, this.my_points[s0].p2.y)
            p.vertex(this.my_points[s1].p1.x, this.my_points[s1].p1.y)
            p.endShape()

        }



        return no_vertices
    }


}


/**
 * stolen code from https://github.com/lovasoa/salesman.js
 * functions to do the optimizations
 * Only used by salesman class below, can be ignored.
 * @param {*} points 
 */

function PathSales(points) {
  this.points = points;
  this.order = new Array(points.length);
  for(var i=0; i<points.length; i++) this.order[i] = i;
  this.distances = new Array(points.length * points.length);
  for(var i=0; i<points.length; i++)
    for(var j=0; j<points.length; j++)
      this.distances[j + i*points.length] = points[i].sales_distance( points[j] );
}
PathSales.prototype.change = function(temp) {
  var i = this.randomPos(), j = this.randomPos();
  var delta = this.delta_distance(i, j);
  if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
    this.swap(i,j);
  }
};
PathSales.prototype.size = function() {
  var s = 0;
  for (var i=0; i<this.points.length; i++) {
    s += this.distance(i, ((i+1)%this.points.length));
  }
  return s;
};
PathSales.prototype.swap = function(i,j) {
  var tmp = this.order[i];
  this.order[i] = this.order[j];
  this.order[j] = tmp;
};
PathSales.prototype.delta_distance = function(i, j) {
  var jm1 = this.index(j-1),
      jp1 = this.index(j+1),
      im1 = this.index(i-1),
      ip1 = this.index(i+1);
  var s = 
      this.distance(jm1, i  )
    + this.distance(i  , jp1)
    + this.distance(im1, j  )
    + this.distance(j  , ip1)
    - this.distance(im1, i  )
    - this.distance(i  , ip1)
    - this.distance(jm1, j  )
    - this.distance(j  , jp1);
  if (jm1 === i || jp1 === i)
    s += 2*this.distance(i,j); 
  return s;
};
PathSales.prototype.index = function(i) {
  return (i + this.points.length) % this.points.length;
};
PathSales.prototype.access = function(i) {
  return this.points[this.order[this.index(i)]];
};
PathSales.prototype.distance = function(i, j) {
  return this.distances[this.order[i] * this.points.length + this.order[j]];
};
// Random index between 1 and the last position in the array of points
PathSales.prototype.randomPos = function() {
  return 1 + Math.floor(Math.random() * (this.points.length - 1));
};

/**
 * Solves the following problem:
 *  Given a list of points and the distances between each pair of points,
 *  what is the shortest possible route that visits each point exactly
 *  once and returns to the origin point?
 * 
 * Fill a list with nodes.
 * Create the class
 * When ready : press solve_sales.
 * The results can be taken getOptimalOrder(). It returns an array wiht indicess with optimal order for input array.
 * 
 *
 **/
class SalesManSolver {
    constructor(sales_nodes) {
        this.points = sales_nodes
        this.path = new PathSales(sales_nodes);
        this.converged = false
        this.temperature = 100 *this.path.access(0). sales_distance( this.path.access(1))
    }

    solve_sales(temp_coeff, max_steps) {
        if (this.points.length < 2) {
            this.converged = true
            return 0;
        }
        if (!temp_coeff)
            temp_coeff = 1 - Math.exp(-10 - Math.min(points.length,1e6)/1e5);
        let steps = 0

        while (this.temperature > 1e-6) {
            this.path.change(this.temperature);
            steps ++
            if (steps >= max_steps) {
                break
            }
            this.temperature *= temp_coeff

        }
        if (steps < max_steps) {
            this.converged = true
        }
        
        return steps
    }
    getOptimalOrder() {
        return this.path.order
    }

}

/**
 * template class for sales nodes. Importand : IMPLEMENT the sales_distance funcion.
 */
class SalesNode {
    constructor() {

    }
    sales_distance(q) {
        return 0
    }
}

 
/**
 * example implementation, originaly used by drawer example above. 
 * Can be used to sort nodes with only one point.
 */
class MySalesPoint extends SalesNode {
    constructor(x,y) {
        super()
        this.x = x
        this.y = y
    }
    sales_distance(q) {
        var dx = this.x - q.x, dy = this.y - q.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
}
 
/**
 * Example implementation, used by drawer above.
 * Used to optimze double points with start and end.
 */

class MySalesDoublePoint extends SalesNode {
    constructor(p1,p2) {
        super()
        this.p1 = p1
        this.p2 = p2
    }
    sales_distance(q) {
        let dx = this.p2.x - q.p1.x
        let dy = this.p2.y - q.p1.y
        return Math.sqrt(dx*dx + dy*dy);
    }
    draw(p) {
        p.circle(this.p1.x, this.p1.y, 5)
        p.circle(this.p2.x, this.p2.y, 5)
        p.line(this.p1.x, this.p1.y,this.p2.x, this.p2.y)

    }

}

/**
 * implementation of node for use with Vertex bundles.
 * When implementing drawer, draw everything first using addVertex.
 * Then can be optimized in SalesmanVerticesNodeSet.
 * 
 * This one you don't need to used, is class needed for SalesmanVerticesNodeSet
 * 
 */
class SalesmanVerticesNode extends SalesNode {
    constructor() {
        super()
        this.vertices = []
    }
    addVertex(x,y) {
        let V = [x,y]
        this.vertices.push(V)
    }

    draw(p) {
        let vertices = 0
        let distance = 0
        let prev_V = null
        for (const v of this.vertices) {
            p.vertex(v[X], v[Y])
            vertices ++
            if (prev_V !== null) {
                distance += len2(sub2(v, prev_V))
            }
            prev_V = v
        }
        return [vertices, distance]
    }

    sales_distance(svn) {
        let dx = this.last()[X] - svn.first()[X]
        let dy = this.last()[Y] - svn.first()[Y]
        return Math.sqrt(dx*dx + dy*dy);
    }
    last() {
        return this.vertices.slice(-1)[0]
    }
    first() {
        return this.vertices[0]
    }
}

/**
 * the class to be used when drawing many lines, which need to be optimized.
 * 
 * 1) First create the salesmanvericesnodeset instance
 * 2) Each beginshape/endShape needs to replaced with beginShape / add vertex
 * 3) Then you can optimize the path (if you want, not per see needed)
 * 4) Use the draw function to final draw.
 * 
 * Note : you need to get the filling of the shapes out of the default draw code, because
 * the optimize path you don't want to do each time. Look at circle_packing for use.
 */
class SalesmanVerticesNodeSet {
    constructor() {
        this.vertices_nodes = []
        this.best_order_indices = []
        this.optimized = false
    }

    beginShape() {
        this.best_order_indices.push(this.vertices_nodes.length)
        this.vertices_nodes.push(new SalesmanVerticesNode())
    }
    addVertex(x,y) {
        this.vertices_nodes.slice(-1)[0].addVertex(x,y)
        
    }
    vertex(x,y) {
        this.addVertex(x,y)
        
    }
    endShape() {
        return
    }

    line(xs,ys, xe,ye) {
        this.beginShape()
        this.addVertex(xs,ys)
        this.addVertex(xe,ye)
        this.endShape()
    }

    optimizePath() {
        if (!this.optimized) {
            let salesman_solver = new SalesManSolver(this.vertices_nodes)
            salesman_solver.solve_sales(1-5e-7, 1e8 )
            this.best_order_indices = salesman_solver.getOptimalOrder()
            this.optimized = true
        }
    }

    draw(p, draw_path) {
        let ver_dist = [0,0]
        for (const ni of this.best_order_indices ) {
            p.beginShape()
            let delta = this.vertices_nodes[ni].draw(p)
            ver_dist = add2(ver_dist, delta)
            p.endShape()

        }
        if (draw_path) {
            p.stroke(255,50,50)

            for (let si = 1; si < (this.best_order_indices.length); si++) {
                let s0 = this.best_order_indices[si-1]
                let s1 = this.best_order_indices[si]
                let s0_node = this.vertices_nodes[s0]
                let s0_last = s0_node.last()
                let s1_node = this.vertices_nodes[s1]
                let s1_first = s1_node.first()
                let X0 = s0_last[X]
                let Y0 = s0_last[Y]
                let X1 = s1_first[X]
                let Y1 = s1_first[Y]
                p.beginShape()
                p.vertex(X0,Y0)
                p.vertex(X1, Y1)
                p.endShape()

                ver_dist = add2(ver_dist, [2, len2(sub2(s0_last, s1_first))])

    
            }
        }

        return ver_dist
    }

}

