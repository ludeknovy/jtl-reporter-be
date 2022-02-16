export interface PgError extends Error {
    code?: string
    port?: number
    address?: string
}
