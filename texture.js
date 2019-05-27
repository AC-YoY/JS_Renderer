class GuaTexture extends GuaObject {
    // 表示三维物体的类
    constructor(source) {
        super()

        const lines = source.split('\n')
        const width = Number(lines[2])
        const height = Number(lines[3])
        this.width = width
        this.height = height
        this.pixels = []

        const colorList = lines.slice(4, 4 + width)
        const delimiter = ' '
        for (let i = 0; i < height; i++) {
            const line = colorList[i]
            const row = line.split(delimiter)
            for(let j = 0; j < width; j++) {
                const hex = Number(row[j]) // 具体的单个数据，不是hex
                let r = (hex & 0xff000000) >>> 24
                let g = (hex & 0x00ff0000) >>> 16
                let b = (hex & 0x0000ff00) >>> 8
                let a = (hex & 0x000000ff)
                const pixel = [r, g, b, a]
                this.pixels[i * width + j] = pixel;
            }
        }
    }

    sample(u, v) {
        if (this.pixels) {
            let tu = Math.abs(Math.floor(u * (this.width - 1)));
            let tv = Math.abs(Math.floor(v * (this.height - 1)));

            let index = tu + tv * this.width;
            const c = GuaColor.new(...this.pixels[index]);

            return c;
        } else {
            return GuaColor.randomColor()
        }
    }
}