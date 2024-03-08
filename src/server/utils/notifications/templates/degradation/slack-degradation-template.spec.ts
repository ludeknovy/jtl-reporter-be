import { slackDegradationTemplate } from "./slack-degradation-template"

describe("Slack Degradation template", () => {
    it("should return correct card payload when url provided", () => {
        const template = slackDegradationTemplate("scenarioName", "http://localhost")
        console.log(JSON.stringify(template))
        expect(template).toEqual({
                blocks: [
                    { type: "header", text: { type: "plain_text", text: "JTL Reporter" } },
                    {
                        type: "header", text: {
                            type: "plain_text",
                            text: "Performance Degradation Detected for scenario: scenarioName",
                        },
                    },
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
                {
                    type: "header",
                    text: { type: "plain_text", text: "Performance Degradation Detected for scenario: scenarioName" },
                }],
        })
    })
})
