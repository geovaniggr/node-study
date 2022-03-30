class PageData {
    constructor({ path, parameters = new Map() }) {
        Object.assign(this, { path, parameters })
    }

    mergeParams(params) {
        for(const [ key, value ] of params) {
            this.parameters.set(key, value )
        }
    }
}

module.exports = PageData
