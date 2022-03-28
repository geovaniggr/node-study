const PageRouter = require('./page-router')

describe("[PageRouter] - Roteamento Prioritário", () => {

    const router = new PageRouter();

    it("O roteador deve encontrar o caminho absoluto", () => {
        const URI = "/times/campeonato-brasileiro"
        const REAL_FILE = "/times/campeonato-brasileiro.html"

        const pageData = router.route(URI)

        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject({})
    })

    it("O roteador deve encontrar o arquivo 'index' na pasta", () => {
        const URI = "/times"
        const REAL_FILE = "/times/index.html"

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject({})
    })

    it("O roteador deve priorizar pastas absolutas", () => {
        const URI = "/times/campeonatos/definicao"
        const REAL_FILE = "/times/campeonatos/definicao.html"

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject({})
    })

    it("O Roteador deve encontrar pastas variáveis", () => {
        const URI = "/times/sudeste"
        const REAL_FILE = "/times/__regiao__/index.html"
        const REAL_PARAMS = {
            regiao: 'sudeste'
        }

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject(REAL_PARAMS)
    })

    it("O Roteador deve encontrar arquivos constantes em pastas variáveis", () => {
        const URI = "/times/nordeste/conhecimentos-gerais"
        const REAL_FILE = "/times/__regiao__/conhecimentos-gerais.html"
        const REAL_PARAMS = {
            regiao: 'nordeste'
        }

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject(REAL_PARAMS)
    })

    it("O roteador deve encontrar arquivos variáveis em pastas variáveis", () => {
        const URI = "/times/sul/serie-a/internacional"
        const REAL_FILE = "/times/__regiao__/__serie__/__time__.html"

        const REAL_PARAMS = {
            regiao: 'sul',
            serie: 'serie-a',
            time: 'internacional'
        }

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject(REAL_PARAMS)
    })

    it("O roteador deve priorizar arquivos constantes", () => {
        const URI = "/times/sul/serie-a/index"
        const REAL_FILE = "/times/__regiao__/__serie__/index.html"

        const REAL_PARAMS = {
            regiao: 'sul',
            serie: 'serie-a',
        }

        const pageData = router.route(URI)
        expect(pageData.path).toContain(REAL_FILE)
        expect(pageData.parameters).toMatchObject(REAL_PARAMS)
    })
})
