/**
 * 
 */
 class ManDraw extends Drawer {

    constructor(gui, xywh, sub_gui = '') {
        let name = "ManDraw"
        super(name, gui, xywh, sub_gui)

        this.setting1()
        this.translation = [this.Middle_x,this.Middle_y ]
        this.zoom = 1
        this.grid = 25
        this.grid_sel_x = 0
        this.grid_sel_y = 0

        this.fps = 0
        this.moving_fps =  new MyFPS(30)
        this.loop = false
        this.triangles = new MyTriangles()

        this.gui_folder_draw_options.add(this, 'R1').onChange(function (v) { cvs.draw() }).min(10)
        this.gui_folder_defaults.add(this, 'zoom').listen()
        this.gui_folder_defaults.add(this, 'fps').listen()
        this.gui_folder_defaults.add(this, 'grid_sel_x').listen()
        this.gui_folder_defaults.add(this, 'grid_sel_y').listen()

        this.gui_folder_defaults.add(this, 'setting1')
        this.gui_folder_defaults.add(this, 'loop').onChange(function (v) { cvs.draw() })
        this.gui_folder_defaults.add(this, 'path_length').listen()
        this.gui_folder_defaults.open()
        this.gui_folder_draw_options.open()

    }
    
    setting1() {
        this.R1 = this.wh_min * 0.15
        this.path_length = 0
        this.kader = false

    }
    

    draw(p5, fgc = [0,0,0], bgc = [255,255,255]) {
        super.draw(p5 ,fgc,bgc)
        if (this.loop ) {
            p5.loop()
        } else {
            p5.noLoop()
        }

        this.moving_fps.add_frame()
        this.fps = this.moving_fps.get_fps()

        // p.translate(this.w/2, this.h/2)
        p5.resetMatrix()
        p5.translate(this.translation[X], this.translation[Y])
        p5.scale(this.zoom)

        // MOUSE
        p5.stroke("red") 
        p5.circle(this.grid_sel_x, this.grid_sel_y, 10)

        // GRID
        p5.stroke(fgc) 
        let p_lt = this.pix_to_draw([this.Left,this.Top])
        let p_rb = this.pix_to_draw([this.Right,this.Bottom])
        for(let x = p_lt[X]; x < p_rb[X]; x += this.grid) {
            for(let y = p_lt[Y]; y <p_rb[Y]; y += this.grid) {
                let gp = this.point_to_grid([x,y])
                p5.point(gp[X], gp[Y])
            }
        }

        let no_vertices = 0
        this.path_length = 0 

        this.triangles.draw(p5)

        return no_vertices
    }


    mousewheel(p, x, y, count) {
        count = super.mousewheel(p,x,y,count)
        if (count > 0) {
            this.zoom += 0.1
        } else {
            this.zoom -= 0.1
            if (this.zoom <= 0.1) {
                this.zoom = 0.1
            }
        }
        // cvs.draw()
    }
    mouseMoved(p, x,y){
        super.mouseMoved(p,x,y)
        let gp = this.point_to_grid(this.pix_to_draw([x,y]))
        this.grid_sel_x = gp[X]
        this.grid_sel_y = gp[Y]
        // cvs.draw()

    }
    mouseClicked(p, x,y) {
        super.mouse(p,x,y)
        let gp = this.point_to_grid(this.pix_to_draw([x,y]))
        this.triangles.addPoint(gp)


    }
    pix_to_draw(p) {
        let dp = new Array(2)
        dp[X] = (p[X]  - this.translation[X]) / this.zoom
        dp[Y] = (p[Y]  - this.translation[Y]) / this.zoom
        return dp
    }
    point_to_grid(p) {
        let gp = new Array(2)
        gp[X] = this.grid*Math.round(p[X] / this.grid)
        gp[Y] = this.grid*Math.round(p[Y] / this.grid)
        return gp
    }


}

