import { slackDegradationTemplate } from "./slack-degradation-template"

describe("Slack Degradation template", () => {
    it("should return correct card payload when url provided", () => {
        const template = slackDegradationTemplate("scenarioName", "http://localhost")
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
        const template = slackDegradationTemplate("scenarioName", undefined)
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
