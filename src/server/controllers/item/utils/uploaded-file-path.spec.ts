import * as path from "path"
import { getUploadedFilePath, UPLOAD_DIRECTORY } from "./uploaded-file-path"

describe("getUploadedFilePath", () => {
    it.each([
        path.join(UPLOAD_DIRECTORY, "upload-id"),
        path.join(UPLOAD_DIRECTORY, "nested", "upload-id"),
        path.join(UPLOAD_DIRECTORY, "..valid-upload"),
    ])("accepts a file inside the upload directory: %s", filename => {
        expect(getUploadedFilePath(filename)).toBe(filename)
    })

    it("normalizes a relative file path inside uploads", () => {
        const filename = path.join("uploads", "nested", "..", "upload-id")

        expect(getUploadedFilePath(filename)).toBe(path.join(UPLOAD_DIRECTORY, "upload-id"))
    })

    it.each([
        path.resolve(UPLOAD_DIRECTORY, "..", "secrets.txt"),
        path.resolve(UPLOAD_DIRECTORY, ".."),
        path.parse(UPLOAD_DIRECTORY).root,
        path.resolve(UPLOAD_DIRECTORY, "..", "uploads-evasive", "file"),
        path.resolve(UPLOAD_DIRECTORY, "..", "uploads", "..", "secrets.txt"),
    ])("rejects paths outside the upload directory: %s", filename => {
        expect(getUploadedFilePath(filename)).toBeUndefined()
    })

    it("rejects the upload directory itself", () => {
        expect(getUploadedFilePath(UPLOAD_DIRECTORY)).toBeUndefined()
    })

    it.each(["", undefined])("rejects an empty or missing filename: %s", filename => {
        expect(getUploadedFilePath(filename)).toBeUndefined()
    })
})
