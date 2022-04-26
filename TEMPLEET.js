
class Drawer {
    constructor(name, gui, xywh, sub_gui) {
        this.gui = gui
        this.xywh = xywh
        this.gui_str = name + sub_gui
        this.gui_folder_draw_options = gui.addFolder(this.gui_str)
        this.kader = true
        this.kader_width = 9

        this.gui_folder_draw_options.add(this,'kader').onChange(function (v) { cvs.draw() }).listen()
        this.gui_folder_defaults = this.gui_folder_draw_options.addFolder('defaults')

        this.selected = false
        this.wh_min = Math.min(xywh['w'], xywh['h'])

        this.set_size(xywh)
        this.draw_max = 1000000

    }

    set_size(xywh) {
        this.xywh = xywh
        this.w = this.xywh['w']
        this.h = this.xywh['h']
        this.Left = this.xywh['x']
        this.Right = this.xywh['x'] + this.w
        this.Top = this.xywh['y']
        this.Bottom = this.xywh['y'] + this.h
        this.Middle_x = this.xywh['x'] + this.w / 2
        this.Middle_y = this.xywh['y'] + this.h / 2
    }

    close() {
        this.gui.removeFolder(this.gui_str)
    }

    mouse(p, x,y){
        if ((x > this.Left) && (x < (this.Right)) && (y > this.Top) && (y < this.Bottom)) {
            this.gui_folder_defaults.open()
            this.gui_folder_draw_options.open()
            this.selected = true
        } else {
            this.gui_folder_defaults.close()
            this.gui_folder_draw_options.close()
            this.selected = false
        }
    }
    mousewheel(p, x, y, count) {
        if ((x > this.Left) && (x < (this.Right)) && (y > this.Top) && (y < this.Bottom)) {
            return count
        } else {
            return 1
        }
    } 
    mouseClicked(p, x, y) {

    }  
    mousePressed(p, x, y) {
        
    } 
    mouseDragged(p, x, y) {
        
    }    
    mouseMoved(p, x,y){
    }

    key(key) {
    }

    draw_plus() {
        this.draw_max += 10
    }

    draw_min() {
        this.draw_max -= 10
        if (this.draw_max < 1) {
            this.draw_max = 1
        }
    }

    draw(p, fgc, bgc) {
        if (p.type === 'SCREEN') {
            p.stroke(bgc) 
            p.fill(bgc)
            p.rect(this.Left,this.Top,this.w,this.h)                 // make sure there is no transparant: movies will fail
        }
        p.stroke(fgc) 
        p.noFill()
        if (this.kader) {
            p.rect(this.Left + this.kader_width, this.Top + this.kader_width,
                 this.w-2*this.kader_width , this.h-2*this.kader_width)
        }
                

    }

    move_middle(V){
        return [this.Middle_x + V[X], this.Middle_y + V[Y]]
    }

    

    vertex_middle(p,x,y){
        p.vertex(this.Middle_x + x, this.Middle_y + y)    
    }

}

/**
 * 
 */
class TEMPLEET extends Drawer {

    constructor(gui, xywh, sub_gui = '') {
        let name = "Templeet"
        super(name, gui, xywh, sub_gui)

        this.setting1()


        this.gui_folder_draw_options.add(this, 'R1').onChange(function (v) { cvs.draw() }).min(10)
        this.gui_folder_defaults.add(this, 'setting1')
        this.gui_folder_defaults.add(this, 'path_length').listen()
        this.gui_folder_defaults.open()
        this.gui_folder_draw_options.open()

    }
    
    setting1() {
        this.R1 = this.wh_min * 0.15
        this.path_length = 0

    }
    

    draw(p, fgc = [0,0,0], bgc = [255,255,255]) {
        super.draw(p ,fgc,bgc)

        let no_vertices = 0
        this.path_length = 0 

        if (true) {
            p.beginShape()
            let V_pref = null
            for (let theta = 0; theta <= p.TWO_PI + FLOATING_POINT_ACCURACY; theta += p.TWO_PI / 100) {
                        // DEBUG sinus
                        let V = this.my_circle_sinus(this.R1, theta)
                        this.vertex_middle(p, V[0], V[1])
                        no_vertices ++

                        if (V_pref !== null) {
                            this.path_length += len2(sub2(V, V_pref))
                        }
                        V_pref = V
            }
            p.endShape()
        }

        return no_vertices
    }


    /**
     * sinus circle around zero, radius R, sinus extra scale S, sinus freq and phi
     * @param {*} R 
     * @param {*} S 
     * @param {*} freq 
     * @param {*} phi 
     * @returns 
     */
    my_circle_sinus(R, phi) {
        // https://upload.wikimedia.org/wikipedia/commons/4/4c/Unit_circle_angles_color.svg
        let x,y
        x = R * Math.sin(phi)
        y = R * Math.cos(phi)
        return [x,y]
    }
}

