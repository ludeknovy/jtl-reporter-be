/* eslint-disable max-len */
export const findItemsForScenario = (projectName, scenarioName, limit, offset) => {
  return {
    text: `SELECT it.id, environment, upload_time as "uploadTime", base, status, st.overview->>'startDate' as "startTime", note, hostname, threshold_result->'passed' as "thresholdPassed", overview -> 'maxVu' AS "maxVu", overview -> 'duration' as duration FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1 AND it.report_status = 'ready'
    ORDER BY start_time DESC
    LIMIT $3 OFFSET $4`,
    values: [projectName, scenarioName, limit, offset]
  };
};

export const itemsForScenarioCount = (projectName, scenarioName) => {
  return {
    text: `SELECT count(*) as total FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1 AND report_status = 'ready';`,
    values: [projectName, scenarioName]
  };
};


export const updateScenario = (projectName, scenarioName, name) => {
  return {
    text: `
    UPDATE jtl.scenario as s
    SET name = $3
    WHERE s.name = $2
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $1)`,
    values: [projectName, scenarioName, name]
  };
};

export const scenarioTrends = (projectName, scenarioName) => {
  return {
    text: `SELECT overview, it.id FROM jtl.item_stat as st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2
    AND p.project_name = $1
    AND report_status = 'ready'
    ORDER BY start_time DESC
    LIMIT 15;`,
    values: [projectName, scenarioName]
  };
};

export const deleteScenario = (projectName, scenarioName) => {
  return {
    text: `DELETE FROM jtl.scenario
    WHERE name = $2 AND project_id = (SELECT id FROM jtl.projects WHERE project_name = $1);`,
    values: [projectName, scenarioName]
  };
};

export const createNewScenario = (projectName, scenarioName) => {
  return {
    text: `INSERT INTO jtl.scenario(name, project_id) VALUES($2, (
      SELECT id FROM jtl.projects WHERE project_name = $1
    ))`,
    values: [projectName, scenarioName]
  };
};

export const findScenarios = projectName => {
  return {
    text: `SELECT s.id, s.name FROM jtl.scenario as s
    LEFT JOIN jtl.projects p ON p.id = s.project_id
    WHERE p.project_name = $1;`,
    values: [projectName]
  };
};

export const findScenariosData = (projectName) => {
  return {
    text: `SELECT s.id as scenario_id, name, st.overview FROM jtl.item_stat st
    LEFT JOIN jtl.items as it ON it.id = st.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    WHERE st.item_id IN (
    SELECT id FROM (
      SELECT scenario_id, id, start_time, row_number() over (PARTITION BY scenario_id ORDER BY start_time DESC) as rownum FROM jtl.items WHERE scenario_id IN (SELECT s.id FROM jtl.scenario as s LEFT JOIN jtl.projects as p ON p.id = s.project_id WHERE p.project_name = $1 AND report_status = 'ready')
      ) tmp
      WHERE rownum <= 15
    )
    ORDER BY it.start_time DESC;`,
    values: [projectName]
  };
};

export const isExistingScenario = (scenarioName, projectName) => {
  return {
    text: `SELECT EXISTS(SELECT * FROM jtl.scenario as s
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE p.project_name = $2
      AND s.name = $1)`,
    values: [scenarioName, projectName]
  };
};

export const getProcessingItems = (projectName, scenarioName) => {
  return {
    text: `SELECT it.id, it.report_status as "reportStatus", it.upload_time as "uploadTime" FROM jtl.items as it
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.item_stat as st ON st.item_id = it.id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $1 AND p.project_name = $2 AND it.report_status != 'ready';`,
    values: [scenarioName, projectName]
  };
};

export const scenarioNotifications = (projectName, scenarioName) => {
  return {
    text: `SELECT notif.id, url, type, notif.name FROM jtl.notifications as notif
    LEFT JOIN jtl.scenario as s ON s.id = notif.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE s.name = $2 AND p.project_name = $1`,
    values: [projectName, scenarioName]
  };
};

export const createScenarioNotification = (projectName, scenarioName, type, url, name) => {
  return {
    text: `INSERT INTO jtl.notifications(scenario_id, type, url, name) VALUES((
      SELECT s.id FROM jtl.scenario as s
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE s.name = $2 AND p.project_name = $1 
    ), $3, $4, $5)`,
    values: [projectName, scenarioName, type, url, name]
  };
};

export const deleteScenarioNotification = (projectName, scenarioName, id) => {
  return {
    text: `DELETE FROM jtl.notifications
     WHERE id = $3 AND scenario_id = (
       SELECT s.id FROM jtl.scenario as s
       LEFT JOIN jtl.projects as p ON p.id = project_id
       WHERE s.name = $2 AND p.project_name = $1)`,
    values: [projectName, scenarioName, id]
  };
};

export const getScenarioThresholds = (projectName, scenarioName) => {
  return {
    text: `SELECT s.threshold_error_rate as "errorRate", s.threshold_percentile as "percentile", s.threshold_throughput as "throughput", s.threshold_enabled as "enabled"  FROM jtl.scenario as s
    LEFT JOIN jtl.projects p ON p.id = s.project_id
    WHERE p.project_name = $1
    AND s.name = $2`,
    values: [projectName, scenarioName]
  };
};

export const updateScenarioThresholds = (projectName, scenarioName, thresholds) => {
  return {
    text: `UPDATE jtl.scenario as s
    SET threshold_percentile = $3, threshold_throughput = $4, threshold_error_rate = $5, threshold_enabled = $6
    WHERE s.name = $2
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $1)`,
    values: [projectName, scenarioName, thresholds.percentile, thresholds.throughput, thresholds.errorRate, thresholds.enabled]
  };
};

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
    values: [projectName, scenarioName, vu]
  };
};

