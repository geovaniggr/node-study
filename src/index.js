const PageRouter = require('./page-router')

const router = new PageRouter();

const uris = [
    "/times/sudeste",
    "/times/campeonato-brasileiro",
    "/times/sudeste/serie-a",
    "/times/sul/sudeste/sao-paulo"
]

uris.map(uri => router.route(uri))
