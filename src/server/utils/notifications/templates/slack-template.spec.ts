import { slackTemplate } from "./slack-template"

describe("Slack template", () => {
    const OVERVIEW = {
        percentil: 10,
        avgConnect: 1,
        avgLatency: 1,
        avgResponseTime: 1,
        duration: 1,
        endDate: new Date(),
        errorCount: 0,
        errorRate: 0,
        maxVu: 10,
        startDate: new Date(),
        throughput: 10,
        bytesPerSecond: 123234,
        bytesSentPerSecond: 12334,
    }
    it("should return correct card payload when url provided", () => {
        const template = slackTemplate("scenarioName", "http://localhost", OVERVIEW)
        console.log(JSON.stringify(template))
        expect(template).toEqual({
                blocks: [
                    { type: "header", text: { type: "plain_text", text: "JTL Reporter" } },
                    { type: "header", text: { type: "plain_text",
                            text: "Performance Report for scenario: scenarioName" } },
                    { type: "divider" }, { type: "section", fields: [{ type: "mrkdwn", text: "*Error Rate*\n0%" }] },
                    { type: "section", fields: [{ type: "mrkdwn", text: "*90% percentile*\n10 ms" }] },
                    { type: "section", fields: [{ type: "mrkdwn", text: "*Throughput*\n10 reqs/s" }] },
                    { type: "section", fields: [{ type: "mrkdwn", text: "*Duration*\n1 min" }] },
                    {
                        type: "section",
                        fields: {
                            type: "button",
                            text: { type: "plain_text", text: "View", emoji: true },
                            value: "click_me_123",
                            url: "http://localhost",
                            action_id: "button-action",
                        },
                    },
                ],
            }
        )
    })
    it("should return card payload when no url provided", () => {
        const template = slackTemplate("scenarioName", undefined, OVERVIEW)
        expect(template).toEqual({
            blocks: [
                { type: "header", text: { type: "plain_text", text: "JTL Reporter" } },
                { type: "header", text: { type: "plain_text", text: "Performance Report for scenario: scenarioName" } },
                { type: "divider" }, { type: "section", fields: [{ type: "mrkdwn", text: "*Error Rate*\n0%" }] },
                { type: "section", fields: [{ type: "mrkdwn", text: "*90% percentile*\n10 ms" }] },
                { type: "section", fields: [{ type: "mrkdwn", text: "*Throughput*\n10 reqs/s" }] },
                { type: "section", fields: [{ type: "mrkdwn", text: "*Duration*\n1 min" }] }],
        })
    })
})
