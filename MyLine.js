// compatibel with 2 and 3 d :-)
class MyLine {
    constructor (p1,p2) {
        this.NO_POINTS = 2
        this.p = Array(this.NO_POINTS)
        this.p[0] = [...p1]
        this.p[1] = [...p2]
        if (p1.length === 2) {
            this.p[0].push(0)
            this.p[1].push(0)
        }
    }

    get_length() {
        return len3(sub3(this.p[1], this.p[0]))
    }

    get_direction() {
        return sub3(this.p[1], this.p[0])
    }
    get_copy() {
        let copy = new MyLine(this.p[0], this.p[1])
        return copy
    }

    scale(S) {
        this.p[0] = scale3(this.p[0], S)
        this.p[1] = scale3(this.p[1], S)
    }
    center_scale(S, center) {
        for (let i = 0; i < this.NO_POINTS; i++) {
            let dir = scale3(sub3(this.p[i], center), S)
            this.p[i] = add3(center, dir)
        }
    }
    translate(t) {
        for (let i = 0; i < this.NO_POINTS; i++) {
            this.p[i] = add3(this.p[i], t)
        }
    }
    transform3(M3) {
        let p0 = [...this.p[0]]
        let p1 = [...this.p[1]]
        this.p[0] = (transform3(p0, M3))  
        this.p[1] = (transform3(p1, M3))
    }

    project(M4) {
        let p0 = [...this.p[0]]
        let p1 = [...this.p[1]]

        this.p[0] = (transform4(p0, M4))  // don't know yet if the array being 4 elemenst is problem
        this.p[1] = (transform4(p1, M4))

    }

    evaluate(lambda) {
        return add3(this.p[0], scale3(this.get_direction(), lambda))
    }


    draw(p) {
        p.beginShape()
        p.vertex(this.p[0][X], this.p[0][Y])
        p.vertex(this.p[1][X], this.p[1][Y])
        p.endShape()
        return 2
    }

    /* get the projected vectors */
    get x1() {return this.p[0][X] }
    get y1() {return this.p[0][Y] }
    get z1() {return this.p[0][Z] }
    get x2() {return this.p[1][X] }
    get y2() {return this.p[1][Y] }
    get z2() {return this.p[1][Z] }

    /**
     * Intersection with the other line in 2 dimensions (xy)
     * returns [v3  : intersection point, only if within line-piece : NO Z])
     */
    intersectionXY(L2, strict = true) {
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        let x1 = this.x1
        let x2 = this.x2
        let y1 = this.y1
        let y2 = this.y2
        let x3 = L2.x1
        let x4 = L2.x2
        let y3 = L2.y1
        let y4 = L2.y2

        let noemer = ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))
        if(Math.abs(noemer) > FLOATING_POINT_ACCURACY ) {
            let t_teller = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) 
            let u_teller = ((x1-x3)*(y1-y2) - (y1-y3)*(x1-x2)) 
            let t = t_teller / noemer

            let p = Array(2)
            p[0] = x1 + t*(x2-x1)
            p[1] = y1 + t*(y2-y1)

            if (strict && ((t_teller > 0) && (t_teller < 1) && 
                 (u_teller > 0) && (u_teller < 1)    )) {
                    // p[2] = this.z1 + t*(this.z2 - this.z1)
                    return p
            } else {
                return p
            }
        }

        return NaN
    }
}