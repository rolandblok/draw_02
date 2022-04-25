
const tail = arr => (arr.length > 1 ? arr.slice(1) : arr)


class MyMovingAverage{
    constructor(depth){
        this.data = []
        this.depth = depth
    }
        
    add_point(p){
        this.data.push(p)
        if (this.data.length > this.depth ) {
            this.data = tail(this.data)
        }
    }

    get_current() {
        let sum = 0
        for (let v of this.data) {
            sum += v
        }
        return sum / this.data.length
    }
}

class MyFPS extends MyMovingAverage {
    constructor(depth){
        super(depth)
        this.last_time_ms =  new Date()
        this.add_frame()
    }   
    add_frame() {
        let cur_time_ms = new Date()
        let d_time_ms = cur_time_ms - this.last_time_ms
        this.add_point(d_time_ms/1000)
        this.last_time_ms = cur_time_ms
    }
    get_fps(){
        return(1/this.get_current())
    }
}