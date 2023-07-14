/* eslint-disable max-len */
export const findItemsForScenario = (projectName, scenarioName, environment, limit, offset) => {
  return {
    text: `SELECT it.id, environment, upload_time as "uploadTime", base, status, st.overview->>'startDate' as "startTime", note, hostname, it.name, threshold_result->'passed' as "thresholdPassed", overview FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1 AND it.report_status = 'ready'
    AND ($5::text is null or it.environment = $5)
    ORDER BY start_time DESC
    LIMIT $3 OFFSET $4`,
    values: [projectName, scenarioName, limit, offset, environment],
  }
}

export const itemsForScenarioCount = (projectName, scenarioName, environment) => {
  return {
    text: `SELECT count(*) as total FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1 AND report_status = 'ready'
    AND ($3::text is null or it.environment = $3);`,
    values: [projectName, scenarioName, environment],
  }
}

export const getScenario = (projectName, scenarioName) => {
  return {
    text: `SELECT * FROM jtl.scenario
    WHERE name = $2 AND project_id = (SELECT id FROM jtl.projects WHERE project_name = $1);`,
    values: [projectName, scenarioName],
  }
}

export const scenarioGenerateToken = (projectName, scenarioName) => {
  return {
    text: `SELECT generate_share_token, label_filter_settings FROM jtl.scenario
    WHERE name = $2 AND project_id = (SELECT id FROM jtl.projects WHERE project_name = $1);`,
    values: [projectName, scenarioName],
  }
}


export const updateScenario = (projectName, scenarioName, name, analysisEnabled, thresholds, deleteSamples, zeroErrorToleranceEnabled, keepTestRunPeriod, generateShareToken, labelFilterSettings, labelTrendChartSettings, extraAggregations, apdexSettings) => {
  return {
    text: `
    UPDATE jtl.scenario as s
    SET name = $3, analysis_enabled=$4, threshold_enabled = $5, threshold_percentile = $6, threshold_throughput = $7, threshold_error_rate = $8, delete_samples = $9, zero_error_tolerance_enabled = $10, keep_test_runs_period = $11, generate_share_token = $12, label_filter_settings = $13, label_trend_chart_settings = $14, extra_aggregations = $15, apdex_settings = $16
    WHERE s.name = $2
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $1)`,
    values: [projectName, scenarioName, name, analysisEnabled, thresholds.enabled, thresholds.percentile, thresholds.throughput, thresholds.errorRate, deleteSamples, zeroErrorToleranceEnabled, keepTestRunPeriod, generateShareToken, labelFilterSettings, labelTrendChartSettings, extraAggregations, apdexSettings],
  }
}

export const scenarioAggregatedTrends = (projectName, scenarioName, environment?) => {
  return {
    text: `SELECT overview, it.id FROM jtl.item_stat as st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    AND report_status = 'ready'
    AND ($3::text is null or it.environment = $3)
    ORDER BY start_time DESC
    LIMIT 15;`,
    values: [projectName, scenarioName, environment],
  }
}

export const scenarioLabelTrends = (projectName, scenarioName, environment) => {
  return {
    text :`SELECT st.stats, it.id, st.overview -> 'startDate' as "startDate" FROM jtl.item_stat as st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    AND report_status = 'ready'
    AND ($3::text is null or it.environment = $3)
    ORDER BY start_time DESC
    LIMIT 15;`,
    values: [projectName, scenarioName, environment],
  }
}

export const deleteScenario = (projectName, scenarioName) => {
  return {
    text: `DELETE FROM jtl.scenario
    WHERE name = $2 AND project_id = (SELECT id FROM jtl.projects WHERE project_name = $1);`,
    values: [projectName, scenarioName],
  }
}

export const createNewScenario = (projectName, scenarioName) => {
  return {
    text: `INSERT INTO jtl.scenario(name, project_id, analysis_enabled) VALUES($2, (
      SELECT id FROM jtl.projects WHERE project_name = $1
    ), $3)`,
    values: [projectName, scenarioName, true],
  }
}

export const findScenarios = projectName => {
  return {
    text: `SELECT s.id, s.name FROM jtl.scenario as s
    LEFT JOIN jtl.projects p ON p.id = s.project_id
    WHERE p.project_name = $1;`,
    values: [projectName],
  }
}

export const findScenariosData = (projectName) => {
  return {
    text: `SELECT s.id as scenario_id, s.name, s.analysis_enabled, st.overview FROM jtl.item_stat st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    WHERE st.item_id IN (
    SELECT id FROM (
      SELECT scenario_id, id, start_time, row_number() over (PARTITION BY scenario_id ORDER BY start_time DESC) as rownum FROM jtl.items WHERE scenario_id IN (SELECT s.id FROM jtl.scenario as s LEFT JOIN jtl.projects as p ON p.id = s.project_id WHERE p.project_name = $1 AND report_status = 'ready')
      ) tmp
      WHERE rownum <= 15
    )
    ORDER BY it.start_time ASC;`,
    values: [projectName],
  }
}

export const isExistingScenario = (scenarioName, projectName) => {
  return {
    text: `SELECT EXISTS(SELECT * FROM jtl.scenario as s
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE p.project_name = $2
      AND s.name = $1)`,
    values: [scenarioName, projectName],
  }
}

export const getProcessingItems = (projectName, scenarioName, environment) => {
  return {
    text: `SELECT it.id, it.report_status as "reportStatus", it.upload_time as "uploadTime" FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $1 AND p.project_name = $2 AND it.report_status != 'ready'
    AND ($3::text is null or it.environment = $3);`,
    values: [scenarioName, projectName, environment],
  }
}

export const scenarioNotifications = (projectName, scenarioName) => {
  return {
    text: `SELECT notif.id, url, type, notif.name FROM jtl.notifications as notif
    LEFT JOIN jtl.scenario as s ON s.id = notif.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1`,
    values: [projectName, scenarioName],
  }
}

export const createScenarioNotification = (projectName, scenarioName, type, url, name) => {
  return {
    text: `INSERT INTO jtl.notifications(scenario_id, type, url, name) VALUES((
      SELECT s.id FROM jtl.scenario as s
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE s.name = $2 AND p.project_name = $1 
    ), $3, $4, $5)`,
    values: [projectName, scenarioName, type, url, name],
  }
}

export const deleteScenarioNotification = (projectName, scenarioName, id) => {
  return {
    text: `DELETE FROM jtl.notifications
     WHERE id = $3 AND scenario_id = (
       SELECT s.id FROM jtl.scenario as s
       LEFT JOIN jtl.projects as p ON p.id = project_id
       WHERE s.name = $2 AND p.project_name = $1)`,
    values: [projectName, scenarioName, id],
  }
}

export const getScenarioSettings = (projectName, scenarioName) => {
  return {
    text: `SELECT s.threshold_error_rate as "errorRate", s.threshold_percentile as "percentile", s.threshold_throughput as "throughput", s.threshold_enabled as "thresholdEnabled", s.delete_samples as "deleteSamples", s.extra_aggregations as "extraAggregations", s.apdex_settings as "apdexSettings"  FROM jtl.scenario as s
    LEFT JOIN jtl.projects p ON p.id = s.project_id
    WHERE p.project_name = $1
    AND s.name = $2`,
    values: [projectName, scenarioName],
  }
}

export const currentScenarioMetrics = (projectName, scenarioName, vu) => {
  return {
    text: `SELECT avg((st.overview->>'percentil')::numeric) as "percentile", avg((st.overview->>'throughput')::numeric) as "throughput", avg((st.overview->>'errorRate')::numeric) as "errorRate" FROM jtl.item_stat as st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    AND report_status = 'ready'
    AND (st.overview->>'maxVu')::numeric = $3`,
    values: [projectName, scenarioName, vu],
  }
}

export const getUserScenarioSettings = (projectName, scenarioName, userId) => {
  return {
    text: `SELECT request_stats_settings, scenario_trends_settings  FROM jtl.user_scenario_settings as rss
    LEFT JOIN jtl.scenario s ON s.id = rss.scenario_id
    LEFT JOIN jtl.projects p on p.id = s.project_id                           
    WHERE p.project_name = $1
    AND s.name = $2
    AND rss.user_id = $3`,
    values: [projectName, scenarioName, userId],
  }
}

export const updateUserScenarioSettings = (projectName, scenarioName, userId, requestStats) => {
  return {
    text: `INSERT INTO jtl.user_scenario_settings (scenario_id, user_id, request_stats_settings)
    SELECT s.id, $3, $4 FROM jtl.scenario s
    LEFT JOIN jtl.projects p on p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    ON CONFLICT (user_id, scenario_id) DO UPDATE SET request_stats_settings = $4`,
    values: [projectName, scenarioName, userId, requestStats],
  }
}

export const updateUserScenarioTrendsSettings = (projectName, scenarioName, userId, trendsSettings) => {
  return {
    text: `INSERT INTO jtl.user_scenario_settings (scenario_id, user_id, scenario_trends_settings)
    SELECT s.id, $3, $4 FROM jtl.scenario s
    LEFT JOIN jtl.projects p on p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    ON CONFLICT (user_id, scenario_id) DO UPDATE SET scenario_trends_settings = $4`,
    values: [projectName, scenarioName, userId, trendsSettings],
  }
}

export const searchResponseTimeDegradation = (projectName, scenarioName, environment?) => {
  return {
    text: `SELECT jsonb_agg(jsonb_build_object(data.label,data.percentile_cont) order by data.label) as data, "maxVu" FROM (
    select overview -> 'maxVu' as "maxVu", x.label,percentile_cont(0.90) within group (order by (x.n0)) from (
        jtl.item_stat as its LEFT JOIN jtl.items as it ON it.id = its.item_id
        LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
        LEFT JOIN jtl.projects as p ON p.id = s.project_id
        )
    , jsonb_to_recordset((its.stats)) as x(label text, n0 double precision)
    WHERE p.project_name = $1
    AND s.name = $2
    AND ($3::text is null or it.environment = $3)
    GROUP BY "maxVu", x.label
    ) as data
    GROUP BY "maxVu";`,
    values: [projectName, scenarioName, environment],
  }
}

export const searchEnvironments = (projectName, scenarioName) => {
  return {
    text: `SELECT DISTINCT(it.environment) FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1`,
    values: [projectName, scenarioName],
  }
}
