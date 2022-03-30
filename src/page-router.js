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
        const page = new Page(uri)

        return Chain
            .of(page)
            .match(this.routeToAbsolutePath.bind(this))
            .orElse(this.routeToVariablePath.bind(this))
            .get()
    }

    routeToAbsolutePath(url) {
        const folders = url.folders.join("/")

        const path = buildPath(PageRouter.PAGE_DIRECTORY, "/", folders)

        return this.findPage(path, url.resource)
    }

    routeToVariablePath(url) {
        const { params, lastAnalyzedPath } = this.diveIntoFolderParameters(url.folders)

        return Chain
            .of(lastAnalyzedPath)
            .match( (path) => {
                const page = this.findPage(path, url.resource)

                if(!page) return

                page.mergeParams(params)

                return page
            })
            .orElse( (path) => {
                const next = this.putFolderParameter(path, url.resource, params)

                if(!next) return

                const page = this.findPage(next)

                if(!page) return

                page.mergeParams(params)

                return page
            })
            .orElse( () => ({ error: "PAGE NOT FOUND" }))
            .get()
    }

    diveIntoFolderParameters(folders) {
        let path = PageRouter.PAGE_DIRECTORY
        const params = new Map()

        for(const folder of folders) {
            const next = this.putFolderParameter(path, folder, params)

            if(!next){
                break
            }

            path = next
        }

        return {
            params,
            lastAnalyzedPath: path
        }
    }

    putFolderParameter(path, folderName, params = new Map()){
        const actualPath = buildPath(path, "/", folderName)
        const existsPath = this.existsFile(actualPath)

        if (existsPath) {
            return actualPath;
        }

        const folder = this.findFileInFolder(path, (file) => this.hasVariableFolder(file, folderName))

        if(!folder) {
            return;
        }

        this.addParameterAsMap(params, folder, folderName)
        return folder.path
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

        if (possibleFile) return new PageData({ path: possibleFile })

        const variableFile = this.findFileInFolder(path, (file) => this.hasVariableFile(file, page))

        if(!variableFile) return

        const URLVars = new Map()

        this.addParameterAsMap(URLVars, variableFile, page)

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

    addParameterAsMap(params, file, page) {
        const rawValue = page.match(file.nameAsRegex)

        if(!rawValue) return

        const key = file.variableKey
        const value = rawValue[0].replace("/", "")

        params.set(key, value)
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

