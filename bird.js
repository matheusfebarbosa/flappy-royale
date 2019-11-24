class Bird {
    constructor(y_axe, height) {
        this.y = y_axe;
        this.x = 64;
        this.height = height;

        this.gravity = 0.7;
        this.lift = -12;
        this.velocity = 0;
    }

    up() {
        this.velocity += this.lift;
    }

    update() {
        this.velocity += this.gravity;
        // this.velocity *= 0.9;
        this.y += this.velocity;

        if (this.y > this.height) {
        this.y = this.height;
        this.velocity = 0;
        }

        if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
        }

    }
}

module.exports = Bird