class Mesh extends Object {
    // 表示三维物体的类
    constructor() {
        super()

        this.position = Vector.new(0, -2, 0)
        this.rotation = Vector.new(0, 0, 0)
        this.scale = Vector.new(1, 1, 1)
        this.vertices = null
        this.indices = null
        this.texture = null
    }
    static from3D(image3d, image) {
        this.texture = Texture.new(image)

        const list = image3d.split('\n')
        const index = Number(list[2].split(' ')[1])
        const triangleLength = Number(list[3].split(' ')[1])

        const pointList = list.slice(4)
        // 顶点
        const vertices = pointList.slice(0, index)
        //
        const indices = pointList.slice(index, index + triangleLength)


        let m = this.new()

        let vertexList = []
        vertices.forEach(p => {
            let [x, y, z, vx, vy, vz, u, v] = p.split(' ').map(e => Number(e))
            let vertex = Vector.new(x, y ,z)
            let c = this.texture.sample(u, v)
            vertexList.push(Vertex.new(vertex, c))
        })
        m.vertices = vertexList

        const triangles = indices.map(line => line.split(' ').map(e => Number(e)))
        m.indices = triangles
        return m
    }
    // 返回一个正方体
    static cube() {
        // 8 points
        let points = [
            -1, 1,  -1,     // 0
            1,  1,  -1,     // 1
            -1, -1, -1,     // 2
            1,  -1, -1,     // 3
            -1, 1,  1,      // 4
            1,  1,  1,      // 5
            -1, -1, 1,      // 6
            1,  -1, 1,      // 7
        ]

        let vertices = []
        for (let i = 0; i < points.length; i += 3) {
            let v = Vector.new(points[i], points[i+1], points[i+2])
            // let c = Color.randomColor()
            let c = Color.randomColor()
            vertices.push(Vertex.new(v, c))
        }

        // 12 triangles * 3 vertices each = 36 vertex indices
        let indices = [
            // 12
            [0, 1, 2],
            [1, 3, 2],
            [1, 7, 3],
            [1, 5, 7],
            [5, 6, 7],
            [5, 4, 6],
            [4, 0, 6],
            [0, 2, 6],
            [0, 4, 5],
            [5, 1, 0],
            [2, 3, 7],
            [2, 7, 6],
        ]
        let m = this.new()
        m.vertices = vertices
        m.indices = indices
        return m
    }
}
