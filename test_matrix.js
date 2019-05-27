class TestMatrix {
    constructor() {
    }
    test() {
        this.testMatrixLookAtLH()
        this.testMatrixRotation()
        this.testMatrixTransform()
    }
    ensure(condition, message) {
        // 如果 condition 为 false，输出 message
        if (condition) {
            log(message, 'success')
        } else {
            log(message, 'failed')
        }
    }
    floatEqual(a, b) {
        // 浮点数不能直接比较，一般用这样的方式来判断
        return a - b <= 0.0001
    }
    matrixEqual(m1, m2) {
        // 判断 2 个 GuaMatrix 是否相等
        return m1.toString() === m2.toString()
    }
    vectorEqual(v1, v2) {
        // 判断 2 个 GuaGuaVector 是否相等
        return v1.toString() === v2.toString()
    }
    testMatrixLookAtLH() {
        let cameraPosition = GuaVector.new(0, 0, 10)
        let cameraTarget = GuaVector.new(0, 0, 0)
        let cameraUp = GuaVector.new(0, 1, 0)
        let matrix = Matrix.lookAtLH(cameraPosition, cameraTarget, cameraUp)
        let values = [
            -1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, -1, 0,
            0, 0, 10, 1,
        ]
        this.ensure(this.matrixEqual(matrix, Matrix.new(values)), 'testMatrixLookAtLH')
    }
    testMatrixRotation() {
        let v = GuaVector.new(10, 20, 30)
        let matrix = Matrix.rotation(v)
        let values = [
            0.554, 0.829, 0.079, 0.000,
            0.327, -0.129, -0.936, 0.000,
            -0.766, 0.544, -0.342, 0.000,
            0.000, 0.000, 0.000, 1.000,
        ]
        this.ensure(this.matrixEqual(matrix, Matrix.new(values)), 'testMatrixRotation')
    }
    testMatrixTransform() {
        let v = GuaVector.new(0.593800, -0.147900, 0.143700)
        let values = [
            -1.774, 0.000, 0.010, 0.010,
            0.000, 2.365, 0.000, 0.000,
            -0.018, 0.000, -1.010, -1.000,
            0.000, 0.000, 10.091, 10.000,
        ]
        let vector = GuaVector.new(-0.107060, -0.035470, 1.009077)
        this.ensure(this.vectorEqual(vector, Matrix.new(values).transform(v)), 'testMatrixTransform')
    }
}

/*
let tm = new TestMatrix()
tm.test()
*/
