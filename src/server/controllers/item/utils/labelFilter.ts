
export const shouldSkipLabel = (label: string, labelFilterSettings: LabelFilterSettings[]): boolean => {
    if (!labelFilterSettings || labelFilterSettings.length === 0) {
        return false
    }
    const labelFilterMatch = labelFilterSettings.find((settings) => {
        if (settings.operator === "includes") {
            return label.includes(settings.labelTerm)
        }
        if (settings.operator === "match") {
            return label === settings.labelTerm
        }
        return false
    })
    return labelFilterMatch ? true : false
}

interface LabelFilterSettings {
    labelTerm: string
    operator: string
}
