import * as path from "path"

// Multer writes uploaded files here. Keep the directory absolute so that all
// subsequent filesystem operations use the same, well-defined root.
export const UPLOAD_DIRECTORY = path.resolve("uploads")

/**
 * Returns an uploaded file path only when it is located below UPLOAD_DIRECTORY.
 * This prevents a filename containing ../ (or an absolute path) from reaching
 * a filesystem read or delete operation.
 */
export const getUploadedFilePath = (filename?: string): string | undefined => {
    if (!filename) {
        return undefined
    }

    const resolvedFilename = path.resolve(filename)
    const relativeFilename = path.relative(UPLOAD_DIRECTORY, resolvedFilename)

    if (!relativeFilename || relativeFilename === ".." ||
        relativeFilename.startsWith(".." + path.sep) || path.isAbsolute(relativeFilename)) {
        return undefined
    }

    return resolvedFilename
}
