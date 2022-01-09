import { config } from "../../../config"
import { generateToken, generateTokenFromToken } from "./token-generator"


config.jwtToken = "123"
config.jwtTokenLogin = "456"


describe("generateToken", () => {

  it("should return valid token", () => {
    const ID = "test-id"
    const token = generateToken(ID)
    const buff = new Buffer(token.split(".")[1], "base64")
    const tokenData = JSON.parse(buff.toString())
    expect(tokenData.userId).toEqual(ID)
  })
})


describe("generateTokenFromToken", () => {
  it("should return valid token", () => {
    const ID = "test-id"
    const token = generateTokenFromToken(ID)
    const buff = Buffer.from(token.split(".")[1], "base64")
    const tokenData = JSON.parse(buff.toString())
    expect(tokenData.userId).toEqual(ID)
  })
})

