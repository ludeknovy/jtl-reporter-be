import { App } from "../../../app"

const app = new App()

beforeAll(async () => {
    // eslint-disable-next-line no-underscore-dangle
    (global as any).__tokenHeaderKey__ = "x-access-token";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    (global as any).__server__ = app.listen()
})

afterAll(async () => {
    app.close()
})
