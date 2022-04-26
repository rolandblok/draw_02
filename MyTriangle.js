

class MyTriangle {
    constructor () {
        this.ps = new Array()
    }
    addPoint(point) {
        if (this.ps.length < 3) {
            if (this._checkPointExist(point) == -1) {
                this.ps.push(point)
                console.log("addPoint " + String(point))
            }
            return true
        } else {
            return false
        }

    }

    draw(p5) {
        if (this.ps.length < 3) {
            p5.stroke("gree") 
        } else {
            p5.stroke("black") 
        }
        for (let p of this.ps) {
            p5.circle(p[X], p[Y], 10)
        }

        if (this.ps.length == 3) {
            p5.noStroke()
            p5.fill(p5.color(255,255,0, 150))
            p5.triangle(this.ps[0][X], this.ps[0][Y], this.ps[1][X], this.ps[1][Y], this.ps[2][X], this.ps[2][Y])
        }
        if (this.ps.length > 1) {
            p5.stroke("black")
            for (let i = 1; i < this.ps.length; i++){
                p5.line(this.ps[i-1][X], this.ps[i-1][Y], this.ps[i%4][X], this.ps[i%4][Y] )
            }
            if (this.ps.length == 3) {
                p5.line(this.ps[2][X], this.ps[2][Y], this.ps[0][X], this.ps[0][Y] )
            }
        }
    }

    _checkPointExist(point) {
        for (let i in this.points) {
            if ((point[X] == this.points[i][X]) && (point[Y] == this.points[i][Y] )) {
                return i
            }
        }
        return -1
    }
}

class MyTriangles {
    constructor () {
        this.ts = new Array()
        this.ts.push(new MyTriangle())
    }
    draw(p5) {
        for (let t of this.ts) {
            t.draw(p5)
        }
    }
    addPoint( point ) {
        console.log(" " + String(this.ts.length))
        while (!this.ts[this.ts.length-1].addPoint(point)){
            this.ts.push(new MyTriangle())
        }
    }
    
}