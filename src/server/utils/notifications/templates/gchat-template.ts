import { Overview } from "../../../data-stats/prepare-data"

export const gchatTemplate = (scenarioName: string, url, overview: Overview) => {
    const cardPayload = {
        cards: [{
            header: {
                title: "JTL Reporter",
                subtitle: `Performance Report for scenario: ${scenarioName}`,
                imageUrl: "",
            },
            sections: [{
                widgets: [
                    { keyValue: { topLabel: "Error Rate", content: `${overview.errorRate} %` } },
                    {
                        keyValue: {
                            topLabel: "90% percentile",
                            content: `${overview.percentil} ms`,
                        },
                    },
                    { keyValue: { topLabel: "Throughput", content: `${overview.throughput} reqs/s` } },
                    {
                        keyValue: {
                            topLabel: "Duration",
                            content: `${overview.duration} min`,
                        },
                    }],
            }],
        }],
    }

    if (url) {
        (cardPayload.cards[0].sections as any).push({
            widgets: [
                {
                    buttons: [
                        {
                            textButton: {
                                text: "OPEN RESULTS",
                                onClick: {
                                    openLink: {
                                        url,
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        })
    }
    return cardPayload
}
