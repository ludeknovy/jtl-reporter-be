import * as path from "path"
import { getUploadedFilePath, UPLOAD_DIRECTORY } from "./uploaded-file-path"

describe("getUploadedFilePath", () => {
    it("accepts files below the upload directory", () => {
        const filename = path.join(UPLOAD_DIRECTORY, "upload-id")

        expect(getUploadedFilePath(filename)).toBe(filename)
    })

    it.each([
        path.join(UPLOAD_DIRECTORY, "..", "secrets.txt"),
        "/tmp/secrets.txt",
        path.join(UPLOAD_DIRECTORY, "..", "uploads-evasive", "file"),
    ])("rejects paths outside the upload directory: %s", filename => {
        expect(getUploadedFilePath(filename)).toBeUndefined()
    })

    it("rejects a missing filename", () => {
        expect(getUploadedFilePath()).toBeUndefined()
    })
})
