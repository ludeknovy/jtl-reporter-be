export const msTeamsDegradationTemplate = (scenarioName: string, url) => {
  const cardPayload = {
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
              text: `Performance Degradation Detected for scenario: ${scenarioName}`,
            },
          ],
          actions: [],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.2",
        },

      },
    ],
  }

  if (url) {
    cardPayload.attachments[0].content.actions.push({
      type: "Action.OpenUrl",
      title: "View",
      url,
    })
  }
  return cardPayload
}


