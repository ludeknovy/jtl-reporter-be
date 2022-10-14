import { gchatTemplate } from "./gchat-template"

describe("GChat template", () => {
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
        const template = gchatTemplate("scenarioName", "http://localhost", OVERVIEW)
        expect(template).toEqual( {
                cards:  [
                    {
                        header:  {
                            imageUrl: "",
                            subtitle: "Performance Report for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [
                            {
                                widgets:  [
                                    {
                                        keyValue:  {
                                            content: "0 %",
                                            topLabel: "Error Rate",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 ms",
                                            topLabel: "90% percentile",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 reqs/s",
                                            topLabel: "Throughput",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "1 min",
                                            topLabel: "Duration",
                                        },
                                    },
                                ],
                            },
                            {
                                widgets:  [
                                    {
                                        buttons:  [
                                            {
                                                textButton:  {
                                                    onClick:  {
                                                        openLink:  {
                                                            url: "http://localhost",
                                                        },
                                                    },
                                                    text: "OPEN RESULTS",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        )
    })
    it("should return card payload when no url provided", () => {
        const template = gchatTemplate("scenarioName", undefined, OVERVIEW)
        expect(template).toEqual({
                cards:  [
                    {
                        header:  {
                            imageUrl: "",
                            subtitle: "Performance Report for scenario: scenarioName",
                            title: "JTL Reporter",
                        },
                        sections:  [
                            {
                                widgets:  [
                                    {
                                        keyValue:  {
                                            content: "0 %",
                                            topLabel: "Error Rate",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 ms",
                                            topLabel: "90% percentile",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "10 reqs/s",
                                            topLabel: "Throughput",
                                        },
                                    },
                                    {
                                        keyValue:  {
                                            content: "1 min",
                                            topLabel: "Duration",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        )
    })
})
