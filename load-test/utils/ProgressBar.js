module.exports = class ProgressBar {
  constructor () {
    this.total = 0
    this.current = 0
    this.barLength = process.stdout.columns - 40
  }

  init (total) {
    this.total = total
    this.current = 0
    this.update(this.current)
  }

  update (current) {
    this.current = current
    const currentProgress = this.current / this.total
    this.draw(currentProgress)
  }

  draw (currentProgress) {
    const filledBarLength = (currentProgress * this.barLength).toFixed(0)
    const emptyBarLength = this.barLength - filledBarLength
    const GREEN = '\x1b[42m]'
    const filledBar = this.getBar(filledBarLength, ' ', GREEN)
    const emptyBar = this.getBar(emptyBarLength, '-')
    const percentageProgress = (currentProgress * 100).toFixed(2)

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(
      `Current progress: [${filledBar}${emptyBar}] | ${percentageProgress}%`
    )
  }

  getBar (length, char, color) {
    let str = ''
    for (let i = 0; i < length; i++) {
      str += char
    }

    return color ? color + str + '\x1b[0m' : str
  }
}
