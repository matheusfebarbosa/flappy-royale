class Pipe {
    constructor(top, width, height) {
        this.spacing = 175;
        this.top = top;
        this.bottom = height - (this.top + this.spacing);
        this.height = height;
        this.x = width;
        this.w = 80;
        this.speed = 5;
        this.highlight = false;
    }

    hits(bird) {
        if ((bird.y < this.top || bird.y > this.height - this.bottom)
            && bird.x > this.x && bird.x < this.x + this.w) {
            this.highlight = true;
            return true;
        }
        this.highlight = false;
        return false;
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return (this.x < -this.w);
    }
}

module.exports = Pipe