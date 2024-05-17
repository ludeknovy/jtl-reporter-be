export class MigrationNotFinishedException extends Error {
    constructor (message) {
        super(message)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}
