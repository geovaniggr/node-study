class Page {
    static SLASH = "/"
    static FIRST_SLASH_OFFSET = 1

    constructor(uri) {
        const indexOfFirstSlash = uri.indexOf(Page.SLASH, Page.FIRST_SLASH_OFFSET)
        const indexOfLastSlash = uri.lastIndexOf(Page.SLASH)

        const absoluteFolder = uri.substring(0, indexOfLastSlash)
        const initialFolder = uri.substring(0, indexOfFirstSlash)

        const resource = uri.substring(absoluteFolder.length)

        this.uri = uri
        this.firstFolder = initialFolder
        this.pathToFolder = absoluteFolder
        this.resource = resource
    }

    get folders() {
        return this.pathToFolder
            .split("/")
            .filter(path => !!path)
    }
}

module.exports = Page
