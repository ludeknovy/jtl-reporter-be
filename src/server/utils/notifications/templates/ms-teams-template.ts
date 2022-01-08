import { Overview } from "../../../data-stats/prepare-data"

export const msTeamsTemplate = (scenarioName: string, url, overview: Overview) => {
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
              text: `Performance Report for scenario: ${scenarioName}`,
            },
            {
              type: "FactSet",
              facts: [
                {
                  title: "Error Rate",
                  value: overview.errorRate + " %",
                },
                {
                  title: "90% percentile",
                  value: overview.percentil + " ms",
                },
                {
                  title: "Throughput",
                  value: overview.throughput + " hits/s",
                }, {
                  title: "Duration",
                  value: overview.duration + " min",
                },
              ],
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


