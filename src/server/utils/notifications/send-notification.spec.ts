import { db } from "../../../db/db"
import { sendReportNotifications } from "./send-notification"
const linkUrl = require("./link-url")
import axios from "axios"
const scenarioNotifications = require("../../queries/scenario")
const msTeamsTemplate = require("./templates/report/ms-teams-template")


jest.mock("axios")
jest.mock("./templates/report/ms-teams-template")
jest.mock("../../../db/db")

const OVERVIEW = {
  percentile90: 10,
  percentile95: 14,
  percentile99: 18,
  avgConnect: 1,
  avgLatency: 1,
  avgResponseTime: 1,
  duration: 1,
  endDate: new Date(),
  errorRate: 0,
  errorCount: 0,
  maxVu: 10,
  startDate: new Date(),
  throughput: 10,
  bytesPerSecond: 20123,
  bytesSentPerSecond: 1233,
}

describe("sendNotification", () => {
  it("should call linkUrl", async () => {
    const spy = jest.spyOn(linkUrl, "linkUrl")
    await sendReportNotifications("test", "test", "id", OVERVIEW)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it("should trigger `scenarioNotifications` query", async () => {
    const spy = jest.spyOn(scenarioNotifications, "scenarioNotificationsByType")
    await sendReportNotifications("test", "test", "id", OVERVIEW)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it("should not send any request if no notifications found in db", async () => {
    db.manyOrNone = jest.fn().mockImplementation(() => Promise.resolve([]))
    await sendReportNotifications("test", "test", "id", OVERVIEW)
    expect(axios).not.toHaveBeenCalled()
  })
  it("should try to send notification request when found in db", async () => {
    const spy = jest.spyOn(msTeamsTemplate, "msTeamsTemplate")
    db.manyOrNone = jest.fn().mockImplementation(() =>
      Promise.resolve([{ url: "test", name: "test-name", channel: "ms-teams" }]))
    const post = axios.post = jest.fn().mockImplementation(() => Promise.resolve({}))
    await sendReportNotifications("test", "test", "id", OVERVIEW)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledTimes(1)
  })
  it("should not throw an error when request failed", () => {
    db.manyOrNone = jest.fn().mockImplementation(() =>
      Promise.resolve([{ url: "test", name: "test-name", channel: "ms-teams" }]))
    axios.post = jest.fn().mockImplementation(() => Promise.reject(new Error("failed")))
    expect(async () => {
      await sendReportNotifications("test", "test", "id", OVERVIEW)
    }).not.toThrow()
  })
})
