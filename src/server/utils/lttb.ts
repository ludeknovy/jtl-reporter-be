// https://github.com/pingec/downsample-lttb
export const downsampleData = (series, threshold) => {
    return largestTriangleThreeBuckets(series, threshold)
}

const floor = Math.floor,
    abs = Math.abs

function largestTriangleThreeBuckets(data, threshold) {

    const dataLength = data.length
    if (threshold >= dataLength || threshold === 0) {
        return data // Nothing to do
    }

    const sampled = []
    let sampledIndex = 0

    // Bucket size. Leave room for start and end data points
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const every = (dataLength - 2) / (threshold - 2)

    let a = 0, // Initially a is the first point in the triangle
        maxAreaPoint,
        maxArea,
        area,
        nextA

    sampled[sampledIndex++] = data[a] // Always add the first point

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    for (let i = 0; i < threshold - 2; i++) {

        // Calculate point average for next bucket (containing c)
        let avgX = 0,
            avgY = 0,
            avgRangeStart = floor( ( i + 1 ) * every ) + 1,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            avgRangeEnd = floor( ( i + 2 ) * every ) + 1
        avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength

        const avgRangeLength = avgRangeEnd - avgRangeStart

        for ( ; avgRangeStart < avgRangeEnd; avgRangeStart++ ) {
            avgX += data[avgRangeStart][0] * 1 // * 1 enforces Number (value may be Date)
            avgY += data[avgRangeStart][1] * 1
        }
        avgX /= avgRangeLength
        avgY /= avgRangeLength

        // Get the range for this bucket
        let rangeOffs = floor( (i + 0) * every ) + 1
        const rangeTo = floor( (i + 1) * every ) + 1

        // Point a
        const pointAX = data[a][0] * 1, // enforce Number (value may be Date)
            pointAY = data[a][1] * 1

        maxArea = area = -1

        for ( ; rangeOffs < rangeTo; rangeOffs++ ) {
            // Calculate triangle area over three buckets
            area = abs( ( pointAX - avgX ) * ( data[rangeOffs][1] - pointAY ) -
                ( pointAX - data[rangeOffs][0] ) * ( avgY - pointAY )
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            ) * 0.5
            if ( area > maxArea ) {
                maxArea = area
                maxAreaPoint = data[rangeOffs]
                nextA = rangeOffs // Next a is this b
            }
        }

        sampled[sampledIndex++] = maxAreaPoint // Pick this point from the bucket
        a = nextA // This a is the next a (chosen b)
    }

    sampled[sampledIndex++] = data[dataLength - 1] // Always add last

    return sampled
}
