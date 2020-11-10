import { lerp } from "./lerp";

export class Vector3 {
    constructor() {
        /** @type {number} */
        this.x = 0;

        /** @type {number} */
        this.y = 0;

        /** @type {number} */
        this.z = 0;

        Object.seal(this);
    }

    /**
     * @param {number} s
     * @returns {Vector3}
     */
    scale(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * @param {Vector3} v
     * @returns {Vector3}
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * @param {Vector3} v
     * @returns {Vector3}
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Vector3}
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * @param {Vector3} v
     * @returns {Vector3}
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * @param {Vector3} v
     * @param {number} p
     * @returns {Vector3}
     */
    lerp(v, p) {
        this.x = lerp(this.x, v.x, p);
        this.y = lerp(this.y, v.y, p);
        this.z = lerp(this.z, v.z, p);
        return this;
    }

    /**
     * @param {Vector3} v
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * @returns {Vector3}
     */
    normalize() {
        const lenSqr = this.dot(this);
        if (lenSqr > 0) {
            const len = Math.sqrt(lenSqr);
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }
}