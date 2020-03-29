export const overviewAggPipeline = (itemId) => {
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
      '$sort': {
        'samples.elapsed': 1
      }
    }, {
      '$group': {
        '_id': null,
        'maxVu': {
          '$max': '$samples.allThreads'
        },
        'start': {
          '$min': '$samples.timeStamp'
        },
        'end': {
          '$max': '$samples.timeStamp'
        },
        'avgConnect': {
          '$avg': '$samples.Connect'
        },
        'avgLatency': {
          '$avg': '$samples.Latency'
        },
        'total': {
          '$sum': 1
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
        'percentil': {
          '$arrayElemAt': [
            '$elapsed', {
              '$floor': {
                '$multiply': [
                  0.90, '$total'
                ]
              }
            }
          ]
        },
        'avgResponse': {
          '$avg': '$elapsed'
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
        'data': 0
      }
    }
  ]
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
      '$sort': {
        'samples.elapsed': 1
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
  ];
};

export const overviewChartAgg = (itemId: string, interval: number) => {
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
      '$group': {
        '_id': {
          '$toDate': {
            '$subtract': [
              {
                '$toLong': '$samples.timeStamp'
              }, {
                '$mod': [
                  {
                    '$toLong': '$samples.timeStamp'
                  }, interval
                ]
              }
            ]
          }
        },
        'min': {
          '$min': '$samples.timeStamp'
        },
        'max': {
          '$max': '$samples.timeStamp'
        },
        'count': {
          '$sum': 1
        },
        'threads': {
          '$max': '$samples.allThreads'
        },
        'avgResponseTime': {
          '$avg': '$samples.elapsed'
        },
        'success': {
          '$push': '$samples.success'
        }
      }
    }, {
      '$addFields': {
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
        },
        'interval': {
          '$divide': [
            {
              '$subtract': [
                '$max', '$min'
              ]
            }, 1000
          ]
        }
      }
    }, {
      '$project': {
        'success': 0
      }
    }, {
      '$addFields': {
        'errorRate': {
          '$multiply': [
            {
              '$divide': [
                '$failed', '$count'
              ]
            }, 100
          ]
        }
      }
    }, {
      '$project': {
        'failed': 0
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ]
};


export const labelChartAgg = (itemId: string, interval: number) => {
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
      '$group': {
        '_id': {
          'interval': {
            '$toDate': {
              '$subtract': [
                {
                  '$toLong': '$samples.timeStamp'
                }, {
                  '$mod': [
                    {
                      '$toLong': '$samples.timeStamp'
                    }, interval
                  ]
                }
              ]
            }
          },
          'label': '$samples.label'
        },
        'min': {
          '$min': '$samples.timeStamp'
        },
        'max': {
          '$max': '$samples.timeStamp'
        },
        'count': {
          '$sum': 1
        },
        'threads': {
          '$max': '$samples.allThreads'
        },
        'avgResponseTime': {
          '$avg': '$samples.elapsed'
        }
      }
    }, {
      '$addFields': {
        'interval': {
          '$divide': [
            {
              '$subtract': [
                '$max', '$min'
              ]
            }, 1000
          ]
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ];
}