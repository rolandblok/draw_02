class MySphere {
    constructor (C, R) {
        this.C = C
        this.R = R
    }

    hit(line)
    {
        //https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
        var R = this.R
        var center = this.C;
        var origin = line.p[0];
        var direction = line.get_direction();

        var t = sub2(origin, center);
        var a = dot2(direction, direction);
        var b = 2.0*dot2(direction,t);
        // var b = scale2(dot2(direction,t), 2)
        var c = dot2(t,t) - R*R;

        var discriminant = b*b - 4.0*a*c;

        let labda = null;
        if (discriminant < 0) {
            return undefined;
        } else if (discriminant > 0) {
            var lambda1 = (-b+Math.sqrt(discriminant))/(2.0*a); 
            var lambda2 = (-b-Math.sqrt(discriminant))/(2.0*a);
            labda = Math.min(lambda1, lambda2);
        } else {
            labda = -b/(2.0*a);
        }
        let hit_position = line.evaluate(labda)
        let hit_normal = this.get_normal(hit_position)

        return new Hitpoint(labda, hit_position, hit_normal)
    }

    get_normal(hit_position) {
        return normalize2(sub2(hit_position, this.C));
    }

    //get/set position
    get x() {
        return C[X]
    }
    get y() {
        return C[Y]
    }
    set x(x) {
        this.C[X] = x
    }
    set y(y) {
        this.C[Y] = y
    }
    
    get radius() {
        return this.three_mesh.scale.x
    }
    set radius(R) {
        this.R = R
    }

    xyAt(phi) {
        // https://upload.wikimedia.org/wikipedia/commons/4/4c/Unit_circle_angles_color.svg
        let x,y
        x = this.C[X] + this.R * Math.cos(phi)
        y = this.C[Y] - this.R * Math.sin(phi)
        return [x,y]
    }   

    draw(p, phi_start, phi_end) {
        let no_vertices = 0;
        p.beginShape()
        let V_pref = null
        for (let theta = phi_start; theta <= phi_end + FLOATING_POINT_ACCURACY; theta += p.TWO_PI / 100) {
            let V = this.xyAt(theta)
            p.vertex(V[0], V[1])
            no_vertices ++

            if (V_pref !== null) {
                this.path_length += len2(sub2(V, V_pref))
            }
            V_pref = V
        }
        p.endShape()
        return no_vertices;
    }

}

class Hitpoint {

    constructor(labda, position, normal) {
        this.labda = labda
        this.position = position
        this.normal = normal
    }
}