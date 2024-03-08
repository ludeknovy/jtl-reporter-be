import { msTeamsDegradationTemplate } from "./ms-teams-degradation-template"

describe("MS Teams Degradation template", () => {
  it("should return correct card payload when url provided", () => {
    const template = msTeamsDegradationTemplate("scenarioName", "http://localhost")
    expect(template).toEqual({
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            type: "AdaptiveCard",
            body: [
              {
                type: "TextBlock",
                size: "Medium",
                weight: "Bolder",
                text: "Performance Degradation Detected for scenario: scenarioName",
              },
            ],
            actions: [
              { type: "Action.OpenUrl", title: "View", url: "http://localhost" }],
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.2",
          },
        }],
    })
  })
  it("should return card payload when no url provided", () => {
    const template = msTeamsDegradationTemplate("scenarioName", undefined)
    expect(template).toEqual({
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            type: "AdaptiveCard",
            body: [
              {
                type: "TextBlock",
                size: "Medium",
                weight: "Bolder",
                text: "Performance Degradation Detected for scenario: scenarioName",
              },
            ],
            actions: [],
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.2",
          },
        }],
    })
  })
})
