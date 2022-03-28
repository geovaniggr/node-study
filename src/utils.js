const buildPath = (...paths) => paths.join("")

const firstMatch = (arr, predicate) => {
    for (const element of arr) {
        if (predicate(element))
            return element
    }
}

const html = (name) => `${name}.html`

module.exports = {
    buildPath,
    firstMatch,
    html
}
