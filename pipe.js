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
        if (bird.y < this.top || bird.y > this.height - this.bottom) {
        if (bird.x > this.x && bird.x < this.x + this.w) {
            this.highlight = true;
            return true;
        }
        }
        this.highlight = false;
        return false;
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        if (this.x < -this.w) {
        return true;
        } else {
        return false;
        }
    }
}

module.exports = Pipe