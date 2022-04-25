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

        this.gui_folder_draw_options.add(this, 'R1').onChange(function (v) { cvs.draw() }).min(10)
        this.gui_folder_defaults.add(this, 'zoom').listen()
        this.gui_folder_defaults.add(this, 'grid_sel_x').listen()
        this.gui_folder_defaults.add(this, 'grid_sel_y').listen()

        this.gui_folder_defaults.add(this, 'setting1')
        this.gui_folder_defaults.add(this, 'path_length').listen()
        this.gui_folder_defaults.open()
        this.gui_folder_draw_options.open()

    }
    
    setting1() {
        this.R1 = this.wh_min * 0.15
        this.path_length = 0
        this.kader = false

    }
    

    draw(p, fgc = [0,0,0], bgc = [255,255,255]) {
        super.draw(p ,fgc,bgc)
        // p.translate(this.w/2, this.h/2)
        p.resetMatrix()
        p.translate(this.translation[X], this.translation[Y])
        p.scale(this.zoom)

        p.stroke("red") 
        p.circle(this.grid_sel_x, this.grid_sel_y, 10)

        p.stroke(fgc) 
        for(let x = -40*this.grid; x < 40*this.grid; x += this.grid) {
            for(let y = -40*this.grid; y < 40*this.grid; y += this.grid) {
                p.point(x,y)
            }
        }

        let no_vertices = 0
        this.path_length = 0 



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
        cvs.draw()
    }
    mouseMoved(p, x,y){
        super.mouseMoved(p,x,y)
        let gp_x = (x  - this.translation[X]) / this.zoom
        let gp_y = (y  - this.translation[Y]) / this.zoom
        this.grid_sel_x = this.grid*Math.round(gp_x / this.grid)
        this.grid_sel_y = this.grid*Math.round(gp_y / this.grid)
        cvs.draw()

    }

    mouse(p, x,y) {

    }


}

