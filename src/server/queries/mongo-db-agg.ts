export const overviewAggPipeline = (itemId) => {
  return [
    {
      '$match': {
        'itemId': itemId
      }
    }, {
      '$addFields': {
        'avgConnect': {
          '$avg': '$samples.Connect'
        },
        'avgLatency': {
          '$avg': '$samples.Latency'
        },
        'total': {
          '$size': '$samples'
        },
        'failed': {
          '$size': {
            '$filter': {
              'input': '$samples',
              'as': 'sample',
              'cond': {
                '$eq': [
                  '$$sample.success', false
                ]
              }
            }
          }
        }
      }
    }, {
      '$group': {
        '_id': null,
        'maxVu': {
          '$max': {
            '$max': '$samples.allThreads'
          }
        },
        'start': {
          '$min': {
            '$min': '$samples.timeStamp'
          }
        },
        'end': {
          '$max': {
            '$max': '$samples.timeStamp'
          }
        },
        'avgConnect': {
          '$max': '$avgConnect'
        },
        'avgLatency': {
          '$avg': '$avgLatency'
        },
        'failed': {
          '$sum': '$failed'
        },
        'total': {
          '$sum': '$total'
        },
        'elapsed': {
          '$push': '$samples.elapsed'
        }
      }
    }, {
      '$addFields': {
        'data': {
          '$reduce': {
            'input': '$elapsed',
            'initialValue': [],
            'in': {
              '$setUnion': [
                '$$value', '$$this'
              ]
            }
          }
        }
      }
    }, {
      '$addFields': {
        'percentil': {
          '$arrayElemAt': [
            '$data', {
              '$floor': {
                '$multiply': [
                  0.90, {
                    '$size': '$data'
                  }
                ]
              }
            }
          ]
        },
        'avgResponse': {
          '$avg': '$data'
        }
      }
    }, {
      '$project': {
        'elapsed': 0,
        'data': 0
      }
    }
  ];
};


export const labelAggPipeline = (itemId) => {
  return [
    {
      '$match': {
        'itemId': itemId
      }
    }, {
      '$unwind': {
        'path': '$samples'
      }
    }, {
      '$unwind': {
        'path': '$samples.label'
      }
    }, {
      '$group': {
        '_id': '$samples.label',
        'minResponseTime': {
          '$min': '$samples.elapsed'
        },
        'maxResponseTime': {
          '$max': '$samples.elapsed'
        },
        'avgResponseTime': {
          '$avg': '$samples.elapsed'
        },
        'avgBytes': {
          '$avg': '$samples.bytes'
        },
        'samplesCount': {
          '$sum': 1
        },
        'start': {
          '$min': '$samples.timeStamp'
        },
        'end': {
          '$max': '$samples.timeStamp'
        },
        'elapsed': {
          '$push': '$samples.elapsed'
        },
        'success': {
          '$push': '$samples.success'
        }
      }
    }, {
      '$addFields': {
        'percentil90': {
          '$arrayElemAt': [
            '$elapsed', {
              '$floor': {
                '$multiply': [
                  0.90, '$samplesCount'
                ]
              }
            }
          ]
        },
        'percentil95': {
          '$arrayElemAt': [
            '$elapsed', {
              '$floor': {
                '$multiply': [
                  0.95, '$samplesCount'
                ]
              }
            }
          ]
        },
        'percentil99': {
          '$arrayElemAt': [
            '$elapsed', {
              '$floor': {
                '$multiply': [
                  0.99, '$samplesCount'
                ]
              }
            }
          ]
        },
        'failed': {
          '$size': {
            '$filter': {
              'input': '$success',
              'as': 'success',
              'cond': {
                '$eq': [
                  '$$success', false
                ]
              }
            }
          }
        }
      }
    }, {
      '$project': {
        'elapsed': 0,
        'success': 0
      }
    }
  ]
}