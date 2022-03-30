const PageRouter = require('./page-router')

const router = new PageRouter();

const uris = [
    "/times/sudeste/chocolate",
]
const result = uris.map(uri => ({uri, result: router.routeToVariablePath2(uri) }))

console.log(result);
