const path = require('path')
const fs = require("fs");

const Chain = require("./chain")
const PageData = require('./page-data')
const Page = require("./page")
const File = require("./file")

const {
    buildPath,
    html,
    firstMatch
} = require('./utils')

class PageRouter {

    static PAGE_DIRECTORY = path.join(__dirname, "..", "pages")

    route(uri) {
        return Chain
            .of(uri)
            .match(this.routeToAbsolutePath.bind(this))
            .orElse(this.routeToVariablePath.bind(this))
            .get()
    }

    routeToAbsolutePath(uri) {
        const url = new Page(uri)

        const folders = url.folders.join("/")

        const path = buildPath(PageRouter.PAGE_DIRECTORY, "/", folders)

        return this.findPage(path, url.page)
    }

    routeToVariablePath(uri) {
        const url = new Page(uri)

        const { executedFullSearch, params, lastAnalyzedPath } = this.diveIntoFolderParameters(url.folders)

        if(!executedFullSearch) return

        const possiblePage = this.findPage(lastAnalyzedPath, url.page)

        if(possiblePage){
            return new PageData({
                path: possiblePage.path,
                parameters: {...possiblePage.parameters, ...params}
            })
        }

        const folder = this.findFileInFolder(lastAnalyzedPath, (file) => this.hasVariableFolder(file, url.page))

        if(!folder) return

        this.addParameter(params, folder, url.page)

        const page = this.findPage(folder.path)

        return new PageData({
            path: page.path,
            parameters: {...params, ...page.parameters}
        })
    }

    diveIntoFolderParameters(folders) {
        console.log(`Iniciando o mergulho`)
        let path = PageRouter.PAGE_DIRECTORY
        const URLVars = {}

        for (const folderName of folders) {
            const actualPath = buildPath(path, "/", folderName)
            const existsPath = this.existsFile(actualPath)

            if (existsPath) {
                console.log(`Existe a pasta ${actualPath} então indo para ela.`)
                path = actualPath
                continue
            }

            const folder = this.findFileInFolder(path, (file) => this.hasVariableFolder(file, folderName))

            if(!folder) {
                console.log(`Terminando a navegação pois não existe arquivo variável na pasta ${actualPath}`)
                console.log("======================================\n\n")
                return {
                    params: URLVars,
                    lastAnalyzedPath: path,
                    executedFullSearch: false
                }
            }

            this.addParameter(URLVars, folder, folderName)
            console.log(`Indo de ${path} para ${folder.path}`)
            path = folder.path

        }

        return {
            params: URLVars,
            lastAnalyzedPath: path,
            executedFullSearch: true
        }
    }

    findFileInFolder(path, predicate) {
        const files = fs
            .readdirSync(path)
            .map( file => new File(path, file) )

        const file = firstMatch(files, predicate)

        return file
    }

    findPage(path, page = "/index" ) {
        const existsFolder = this.existsFile(path)

        if(!existsFolder) return

        const SLASH = "/"

        const possibleAbsolutePaths = Array.of(
            buildPath(path, html(page)),
            buildPath(path, page, SLASH, html("index"))
        )

        const possibleFile = firstMatch(possibleAbsolutePaths, this.existsFile)

        if (possibleFile) return new PageData({path: possibleFile, parameters: {}})

        const variableFile = this.findFileInFolder(path, (file) => this.hasVariableFile(file, page))

        if(!variableFile) return

        const URLVars = {}

        this.addParameter(URLVars, variableFile, page)

        return new PageData({
            path: variableFile.path,
            parameters: URLVars
        })

    }

    addParameter(params, file, page) {
        const rawValue = page.match(file.nameAsRegex)

        if(!rawValue) return

        const key = file.variableKey
        const value = rawValue[0].replace("/", "")

        params[key] = value
    }

    existsFile(path) {
        return fs.existsSync(path)
    }

    isDirectory(path){
        return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    }

    hasVariableFolder(file, page){
        const isDirectory = file.isDirectory
        const match = page.match(file.nameAsRegex)
        return isDirectory && match
    }

    hasVariableFile(file, page){
        return (!file.isDirectory) && page.match(file.nameAsRegex)
    }

}

module.exports = PageRouter

