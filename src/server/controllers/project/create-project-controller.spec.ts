import { db } from "../../../db/db"
import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { createProjectController } from "./create-project-controller"
import * as boom from "boom"
import { AllowedRoles } from "../../middleware/authorization-middleware"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}


describe("createProjectController", function () {
    it("should return conflict if project already exists", async function () {
        const response = mockResponse()
        const next = jest.fn();

        (db.one as any).mockResolvedValue({ exists: true })

        const spy = jest.spyOn(require("../../queries/projects"), "isExistingProject")

        const request = { body: { projectName: "test", projectMembers: [] } }

        await createProjectController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response, next)

        expect(next).toHaveBeenNthCalledWith(1, boom.conflict("Project already exists"))
        expect(spy).toHaveBeenCalledWith("test")
    })
    it("should grant access to all admin users and to the user as well in case it's not an admin", async function () {
        const response = mockResponse()
        const next = jest.fn()

        const request = {
            body: { projectName: "test-project", projectMembers: [] }, user: {
                role: AllowedRoles.Operator,
                userId: 567,
            },
        };

        (db.one as any).mockResolvedValueOnce({ exists: false });
        (db.one as any).mockResolvedValueOnce({ id: "123" })
        const createNewProjectSpy = jest.spyOn(require("../../queries/projects"), "createNewProject")
        const assignAllAdminsAsProjectMembersSpy = jest.spyOn(require("../../queries/user-project-access"),
            "assignAllAdminsAsProjectMembers")
        const addProjectMemberSpy = jest.spyOn(require("../../queries/user-project-access"), "addProjectMember")

        await createProjectController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response, next)
        expect(createNewProjectSpy).toHaveBeenNthCalledWith(1, "test-project")
        expect(assignAllAdminsAsProjectMembersSpy).toHaveBeenNthCalledWith(1, "123")
        expect(addProjectMemberSpy).toHaveBeenNthCalledWith(1, "123", request.user.userId)
        expect(response.send).toHaveBeenCalledTimes(1)
    })
    it("should grant access to project members when request made with admin role",
        async function () {
            const response = mockResponse()
            const next = jest.fn()
            const projectMemberId = 831
            const request = {
                body: { projectName: "test-project", projectMembers: [projectMemberId] }, user: {
                    role: AllowedRoles.Admin,
                    userId: 567,
                },
            };

            (db.one as any).mockResolvedValueOnce({ exists: false });
            (db.one as any).mockResolvedValueOnce({ id: "123" })
            const dbNoneMock = (db.none as any).mockImplementationOnce(() => jest.fn())

            await createProjectController(request as unknown as IGetUserAuthInfoRequest,
                response as unknown as Response, next)
            // eslint-disable-next-line max-len
            expect(dbNoneMock).toHaveBeenNthCalledWith(1, "insert into \"jtl\".\"user_project_access\"(\"project_id\",\"user_id\") values('123',831)")
            expect(response.send).toHaveBeenCalledWith()

        })
})
