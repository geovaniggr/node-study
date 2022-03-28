const fs = require("fs");
const path = require("path");

const { buildPath } = require("./utils");

class File {
    static isFileADirectory = (path) => fs.lstatSync(path).isDirectory()
    static existsPath = (path) => fs.existsSync(path)
    static escapedPattern = /([\.\-\_])/g;
    static variableFilePatternWithEscaped = /\\_\\_([a-zA-Z0-9]+)\\_\\_/g
    static variableFilePattern = /__([a-zA-Z0-9\-\_]+)__/

    constructor(path, file) {
        this.file = file
        this.path = buildPath(path, "/", file)
        this.isDirectory = File.existsPath(this.path) && File.isFileADirectory(this.path)
    }

    get escapedName(){
        return path.basename(this.file, ".html").replace(File.escapedPattern, "\\$1")
    }

    get nameAsRegex(){
        const escapedName = this.escapedName

        return escapedName.replace(File.variableFilePatternWithEscaped, "([A-Za-z0-9-_]+)")
    }

    get variableKey(){
        const match = File.variableFilePattern.exec(this.file)
        if(!match) return

        return match[1]
    }
}

module.exports = File
