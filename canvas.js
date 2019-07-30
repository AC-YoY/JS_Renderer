class Camera extends Object {
    constructor() {
        super()
        // 镜头在世界坐标系中的坐标
        this.position = Vector.new(0, 0, -10)
        // 镜头看的地方
        this.target = Vector.new(0, 0, 0)
        // 镜头向上的方向
        this.up = Vector.new(0, 1, 0)
    }
}

class Canvas extends Object {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.zLevel = Array(this.w * this.h).fill(null)
        this.bytesPerPixel = 4
        // this.pixelBuffer = this.pixels.data
        this.camera = Camera.new()
    }
    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    clear(color=Color.transparent()) {
        // 清空zLevel
        this.zLevel.fill(null, 0, this.w * this.h)
        // color Color
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color, 0)
            }
        }
        this.render()
    }
    _getPixel(x, y) {
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        return Color.new(p[i], p[i+1], p[i+2], p[i+3])
    }
    _setPixel(x, y, color, z) {
        // color: Color
        // 这个函数用来设置像素点, _ 开头表示这是一个内部函数, 这是我们的约定
        // 浮点转 int
        let int = Math.round
        x = int(x)
        y = int(y)
        // 设置z
        let j = y * this.w + x
        const depth = this.zLevel[j]
        if (depth != null && depth > z) return
        this.zLevel[j] = z
        // 用座标算像素下标
        let i = j * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        // 一个像素 4 字节, 分别表示 r g b a
        p[i] = int(r)
        p[i+1] = int(g)
        p[i+2] = int(b)
        p[i+3] = int(a)
    }
    drawPoint(point, color=Color.black()) {
        // point: Point
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, color, p.z)
            }
        }
    }
    drawLine(p1, p2, color=Color.black()) {
        let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y]
        let dx = x2 - x1
        let dy = y2 - y1
        let R = (dx ** 2 + dy ** 2) ** 0.5
        let ratio = dx === 0 ? undefined : dy / dx
        let angle = 0
        if (ratio === undefined) {
            const p = Math.PI / 2
            angle = dy >= 0 ? p : -p
        } else {
            const t = Math.abs(dy / R)
            const sin = ratio >= 0 ? t : -t
            const asin = Math.asin(sin)
            angle = dx > 0 ? asin : asin + Math.PI
        }
        for (let r = 0; r <= R; r++) {
            const x = x1 + Math.cos(angle) * r
            const y = y1 + Math.sin(angle) * r
            this.drawPoint(Vector.new(x, y, p1.z), color)
        }
    }
    drawScanline(v1, v2) {
        let [a, b] = [v1, v2].sort((va, vb) => va.position.x - vb.position.x)
        let y = a.position.y
        let x1 = a.position.x
        let x2 = b.position.x
        for (let x = x1; x <= x2; x++) {
            let factor = 0
            if (x2 != x1) {
                factor = (x - x1) / (x2 - x1);
            }
            let color = a.color.interpolate(b.color, factor)
            // console.log(v1.position.z)
            this.drawPoint(Vector.new(x, y, v1.position.z), color)
        }
    }
    drawTriangle(v1, v2, v3) {
        let [a, b, c] = [v1, v2, v3].sort((va, vb) => va.position.y - vb.position.y)
        // log(a, b, c)
        let middle_factor = 0
        if (c.position.y - a.position.y != 0) {
            middle_factor = (b.position.y - a.position.y) / (c.position.y - a.position.y)
        }
        let middle = a.interpolate(c, middle_factor)
        let start_y = a.position.y
        let end_y = b.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = a.interpolate(middle, factor)
            let vb = a.interpolate(b, factor)
            // log(va.position, vb.position)
            this.drawScanline(va, vb)
        }
        start_y = b.position.y
        end_y = c.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = middle.interpolate(c, factor)
            let vb = b.interpolate(c, factor)
            // log(va.position, vb.position)
            this.drawScanline(va, vb)
        }
    }
    // drawTriangleLine
    project(coordVector, transformMatrix) {
        let {w, h} = this
        let [w2, h2] = [w/2, h/2]
        let point = transformMatrix.transform(coordVector.position)
        let x = point.x * w2 + w2
        let y = - point.y * h2 + h2
        let z = point.z // coordVector.position.z

        let v = Vector.new(x, y, z)
        return Vertex.new(v, coordVector.color)
    }
    drawMesh(mesh) {
        let self = this
        // camera
        let {w, h} = this
        let {position, target, up} = self.camera
        const view = Matrix.lookAtLH(position, target, up)
        // field of view
        const projection = Matrix.perspectiveFovLH(0.8, w / h, 0.1, 1)

        // 得到 mesh 中点在世界中的坐标
        const rotation = Matrix.rotation(mesh.rotation)
        const translation = Matrix.translation(mesh.position)
        const scale = Matrix.scale(mesh.scale)
        const world = scale.multiply(rotation.multiply(translation))

        const transform = world.multiply(view).multiply(projection)

        for (let t of mesh.indices) {
            // 拿到三角形的三个顶点
            let [a, b, c] = t.map(i => mesh.vertices[i])
            // 拿到屏幕上的 3 个像素点
            let [v1, v2, v3] = [a, b, c].map(v => self.project(v, transform))
            // 把这个三角形画出来
            // self.drawLine(v1.position, v2.position)
            // self.drawLine(v1.position, v3.position)
            // self.drawLine(v2.position, v3.position)
            self.drawTriangle(v1, v2, v3)
        }
    }
    drawTexture(texture) {
        const t = texture
        t.pixels.forEach((p, index) => {
            const [r, g, b, a] = p
            const c = Color.new(r, g, b, a)
            const y = Math.floor(index / t.width)
            const x = index % t.width
            this.drawPoint(Vector.new(x, y), c)
        })
    }
    __debug_draw_demo() {
        // 这是一个 demo 函数, 用来给你看看如何设置像素
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 255
            a = 255
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }
}
