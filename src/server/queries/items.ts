import { ItemDataType } from './items.model';

// eslint-disable-next-line max-len
export const createNewItem = (scenarioName, startTime, environment, note, status, projectName, hostname, reportStatus) => {
  return {
    // eslint-disable-next-line max-len
    text: `INSERT INTO jtl.items(scenario_id, start_time, environment, note, status, hostname, report_status) VALUES(
      (SELECT sc.id FROM jtl.scenario as sc
        LEFT JOIN jtl.projects as p ON p.id = sc.project_id
        WHERE sc.name = $1
        AND p.project_name = $6), $2, $3, $4, $5, $7, $8) RETURNING id`,
    values: [scenarioName, startTime, environment, note, status, projectName, hostname, reportStatus]
  };
};

export const savePlotData = (itemId, data) => {
  return {
    text: 'INSERT INTO jtl.charts(item_id, plot_data) VALUES($1, $2)',
    values: [itemId, data]
  };
};

export const findItem = (itemId, projectName, scenarioName) => {
  return {
    // eslint-disable-next-line max-len
    text: `SELECT charts.plot_data, note, environment, status, hostname, s.analysis_enabled as "analysisEnabled", threshold_result as "thresholds", report_status as "reportStatus", (SELECT items.id FROM jtl.items as items
      LEFT JOIN jtl.charts as charts ON charts.item_id = items.id
      LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE s.name = $3
      AND p.project_name = $2
      AND base is not null) as base_id
    FROM jtl.items as items
    LEFT JOIN jtl.charts as charts ON charts.item_id = items.id
    LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE items.id = $1
    AND p.project_name = $2
    AND s.name = $3;`,
    values: [itemId, projectName, scenarioName]
  };
};

export const findItemStats = (testItem) => {
  return {
    text: 'SELECT stats, overview, sut as "sutOverview" FROM jtl.item_stat WHERE item_id = $1',
    values: [testItem]
  };
};

export const updateNote = (itemId, projectName, note) => {
  return {
    text: 'UPDATE jtl.items SET note = $3 WHERE id = $1 AND project_id = $2;',
    values: [itemId, projectName, note]
  };
};

export const saveItemStats = (itemId, stats, overview, sutOverview) => {
  return {
    text: 'INSERT INTO jtl.item_stat(item_id, stats, overview, sut) VALUES($1, $2, $3, $4);',
    values: [itemId, stats, overview, sutOverview]
  };
};

export const updateTestItemInfo = (itemId, scenarioName, projectName, note, environment, hostname) => {
  return {
    text: `UPDATE jtl.items as it
    SET note = $3, environment = $4, hostname = $6
    FROM jtl.scenario as s
    WHERE it.id = $1
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $2)
    AND s.name = $5`,
    values: [itemId, projectName, note, environment, scenarioName, hostname]
  };
};

export const deleteItem = (projectName, scenarioName, itemId) => {
  return {
    text: `DELETE FROM jtl.items as it
    USING jtl.scenario as s
    WHERE it.id = $1
    AND s.name = $2
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $3)`,
    values: [itemId, scenarioName, projectName]
  };
};

export const saveData = (itemId, data, dataType) => {
  return {
    text: 'INSERT INTO jtl.data(item_id, item_data, data_type) VALUES($1, $2, $3)',
    values: [itemId, data, dataType]
  };
};

export const findData = (itemId, dataType) => {
  return {
    text: 'SELECT item_data FROM jtl.data WHERE item_id = $1 AND data_type = $2',
    values: [itemId, dataType]
  };
};


export const findErrors = (itemId, projectName) => {
  return {
    text: `SELECT item_data as errors FROM jtl.items as items
    LEFT JOIN jtl.data as data ON data.item_id = items.id
    LEFT JOIN jtl.scenario as s ON s.id = items.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE items.id = $1
    AND p.project_name = $2
    AND data_type = $3`,
    values: [itemId, projectName, ItemDataType.Error]
  };
};

export const findAttachements = itemId => {
  return {
    text: `SELECT d.data_type as type FROM jtl.data d
    WHERE d.item_id = $1
    AND d.data_type != $2;`,
    values: [itemId, ItemDataType.Kpi]
  };
};

export const removeCurrentBaseFlag = (scenarioName, projectName) => {
  return {
    text: `UPDATE jtl.items SET base = NULL
    WHERE base
    AND scenario_id = (SELECT sc.id FROM jtl.scenario as sc
      LEFT JOIN jtl.projects as p ON p.id = sc.project_id
      WHERE sc.name = $1 AND p.project_name = $2);`,
    values: [scenarioName, projectName]
  };
};

export const setBaseFlag = (itemId, scenarioName, projectName) => {
  return {
    text: `UPDATE jtl.items SET base = TRUE
    WHERE id = $1
    AND scenario_id = (
      SELECT sc.id FROM jtl.scenario as sc
      LEFT JOIN jtl.projects as p ON p.id = sc.project_id
      WHERE sc.name = $2 AND p.project_name = $3);`,
    values: [itemId, scenarioName, projectName]
  };
};

export const dashboardStats = () => {
  return {
    text: `
    SELECT round(AVG((overview -> 'maxVu')::int)) as "avgVu",
    round(AVG((overview -> 'duration')::int)) as "avgDuration",
    round(SUM((overview -> 'duration')::int)) as "totalDuration",
    count(*) as "totalCount" from jtl.item_stat as stat
    LEFT JOIN jtl.items as items ON items.id = stat.item_id
    WHERE items.report_status = 'ready';`
  };
};

export const getLabelHistory = (scenarioName, projectName, endpointName, itemId, environment) => {
  return {
    text: `
    SELECT * FROM (SELECT jsonb_array_elements(stats) as labels, item_id,
    its.start_time, overview->'maxVu' as max_vu FROM jtl.item_stat as st
    LEFT JOIN jtl.items as its ON its.id = st.item_id
    LEFT JOIN jtl.scenario as sc ON sc.id = its.scenario_id
    LEFT JOIN jtl.projects as pr ON pr.id = sc.project_id
    WHERE sc.name = $1
    AND pr.project_name = $2
    AND environment = $5
    ORDER BY its.start_time ASC) as stats
    WHERE labels->>'label' = $3
    AND start_time <= (SELECT start_time FROM jtl.items WHERE id = $4)
    LIMIT 50;`,
    values: [scenarioName, projectName, endpointName, itemId, environment]
  };
};

export const getLabelHistoryForVu = (scenarioName, projectName, endpointName, itemId, environment, vu) => {
  return {
    text: `
    SELECT * FROM (SELECT jsonb_array_elements(stats) as labels, item_id,
    its.start_time, overview->'maxVu' as max_vu FROM jtl.item_stat as st
    LEFT JOIN jtl.items as its ON its.id = st.item_id
    LEFT JOIN jtl.scenario as sc ON sc.id = its.scenario_id
    LEFT JOIN jtl.projects as pr ON pr.id = sc.project_id
    WHERE sc.name = $1
    AND pr.project_name = $2
    AND environment = $5
    ORDER BY its.start_time ASC) as stats
    WHERE labels->>'label' = $3
    AND start_time <= (SELECT start_time FROM jtl.items WHERE id = $4)
    AND max_vu::integer = $6
    LIMIT 50;`,
    values: [scenarioName, projectName, endpointName, itemId, environment, vu]
  };
};

export const getMaxVuForLabel = (scenarioName, projectName, endpointName, itemId, environment) => {
  return {
    text: `
    SELECT DISTINCT max_vu as "maxVu", count(*) FROM (SELECT jsonb_array_elements(stats) as labels, item_id,
    its.start_time, overview->'maxVu' as max_vu FROM jtl.item_stat as st
    LEFT JOIN jtl.items as its ON its.id = st.item_id
    LEFT JOIN jtl.scenario as sc ON sc.id = its.scenario_id
    LEFT JOIN jtl.projects as pr ON pr.id = sc.project_id
    WHERE sc.name = $1
    AND pr.project_name = $2
    AND environment = $5
    ORDER BY its.start_time DESC) as stats
    WHERE labels->>'label' = $3
    AND start_time <= (SELECT start_time FROM jtl.items WHERE id = $4)
    GROUP BY stats.max_vu;`,
    values: [scenarioName, projectName, endpointName, itemId, environment]
  };
};

export const getErrorsForLabel = (itemId, labelName) => {
  return {
    // eslint-disable-next-line max-len
    text: 'SELECT * FROM (SELECT  jsonb_array_elements(item_data->\'testResults\'->\'httpSample\') as error FROM jtl.data d WHERE d.data_type = \'error\' AND d.item_id = $1) as errors WHERE error->>\'lb\' = $2;',
    values: [itemId, labelName]
  };
};

export const updateItemStatus = (itemId, reportStatus) => {
  return {
    text: 'UPDATE jtl.items SET report_status = $2 WHERE id = $1;',
    values: [itemId, reportStatus]
  };
};

export const aggOverviewQuery = (itemId) => {
  return {
    text: `
    SELECT
    percentile_cont(0.90) within group (order by (samples.elapsed))::real as n90,
    COUNT(DISTINCT samples.hostname)::int number_of_hostnames,
    COUNT(DISTINCT samples.sut_hostname)::int number_of_sut_hostnames,
    MAX(samples.timestamp) as end,
    MIN(samples.timestamp) as start,
    AVG(samples.latency)::real as avg_latency,
    AVG(samples.connect)::real as avg_connect,
    count(*) filter (where samples.success = false)::int as number_of_failed,
    AVG(samples.elapsed)::real as avg_response,
    SUM(samples.sent_bytes)::bigint as bytes_sent_total,
    SUM(samples.bytes)::bigint as bytes_received_total,
    COUNT(*)::int as total
  FROM jtl.samples as samples
  WHERE item_id = $1;`,
    values: [itemId]
  };
};

export const aggLabelQuery = (item_id) => {
  return {
    text: `
    SELECT 
      samples.label,
      count(*)::int as total_samples,
      AVG(samples.elapsed)::real as avg_response,
      MIN(samples.elapsed)::real as min_reponse,
      MAX(samples.elapsed)::real as max_response,
      percentile_cont(0.99) within group (order by (samples.elapsed))::real as n99,
      percentile_cont(0.95) within group (order by (samples.elapsed))::real as n95,
      percentile_cont(0.90) within group (order by (samples.elapsed))::real as n90,
      MAX(samples.timestamp) as end,
      MIN(samples.timestamp) as start,
      count(*) filter (where samples.success = false)::int as number_of_failed,
      SUM(samples.sent_bytes)::bigint as bytes_sent_total,
      SUM(samples.bytes)::bigint as bytes_received_total
    FROM jtl.samples as samples
    WHERE item_id = $1
    GROUP BY samples.label;`,
    values: [item_id]
  };
};

export const sutOverviewQuery = (item_id) => {
  return {
    text: `
    SELECT 
      samples.sut_hostname,
      MIN(samples.timestamp) as start,
      MAX(samples.timestamp) as end,
      AVG(samples.connect)::real as avg_connect,
      AVG(samples.latency)::real as avg_latency,
      AVG(samples.elapsed)::real as avg_response,
      percentile_cont(0.90) within group (order by (samples.elapsed))::real as n90,
      SUM(samples.sent_bytes) as bytes_sent_total,
      SUM(samples.bytes) as bytes_received_total,
      count(*) filter (where samples.success = false) as number_of_failed,
      count(*) as total
    FROM jtl.samples as samples
    WHERE item_id = $1
    GROUP BY samples.sut_hostname;`,
    values: [item_id]
  };
};

export const chartOverviewQuery = (interval, item_id) => {
  return {
    text: `
    SELECT
      time_bucket($1, timestamp) as time,
      percentile_cont(0.90) within group (order by (samples.elapsed))::real as n90,
      EXTRACT(EPOCH FROM (MAX(samples.timestamp) - MIN(samples.timestamp))) as interval,
      (count(*) filter (where samples.success = false)::real / count(*)::real)::real as error_rate,
      AVG(samples.elapsed)::real as avg_response,
      SUM(samples.sent_bytes)::int as bytes_sent_total,
      SUM(samples.bytes)::int as bytes_received_total,
      MAX(samples.all_threads)::int as threads,
      COUNT(*)::int as total
    FROM jtl.samples as samples
    WHERE item_id = $2
    GROUP BY time;`,
    values: [interval, item_id]
  };
};

export const charLabelQuery = (interval, item_id) => {
  return {
    text: `
    SELECT
      time_bucket($1, timestamp) as time,
      samples.label,
      percentile_cont(0.99) within group (order by (samples.elapsed))::real as n99,
      percentile_cont(0.95) within group (order by (samples.elapsed))::real as n95,
      percentile_cont(0.90) within group (order by (samples.elapsed))::real as n90,
      MIN(samples.elapsed)::real as min_response,
      MAX(samples.elapsed)::real as max_response,
      EXTRACT(EPOCH FROM (MAX(samples.timestamp) - MIN(samples.timestamp))) as interval,
      (count(*) filter (where samples.success = false)::real / count(*)::real)::real as error_rate,
      AVG(samples.elapsed)::real as avg_response,
      SUM(samples.sent_bytes)::int as bytes_sent_total,
      SUM(samples.bytes)::int as bytes_received_total,
      COUNT(*)::int as total
    FROM jtl.samples as samples
    WHERE item_id = $2
    GROUP BY time, samples.label;`,
    values: [interval, item_id]
  };
};

export const distributedThreadsQuery = (interval, item_id) => {
  return {
    text: `
    SELECT 
      time_bucket($1, timestamp) as time,
      samples.hostname,
      AVG(samples.all_threads)::int as threads  
    FROM jtl.samples samples WHERE item_id = $2 
    AND samples.response_message not like 'Number of samples in transaction%'
    GROUP BY time, samples.hostname
    ORDER BY time ASC;`,
    values: [interval, item_id]
  };
};

export const updateItem = (itemId, reportStatus, startTime) => {
  return {
    text: 'UPDATE jtl.items SET report_status = $2, start_time= $3 WHERE id = $1;',
    values: [itemId, reportStatus, startTime]
  };
};


export const findShareToken = (projectName, scenarioName, itemId, token) => {
  return {
    text: `SELECT t.token FROM jtl.share_tokens as t
    LEFT JOIN jtl.items as it ON it.id = t.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE p.project_name = $1
    AND s.name = $2
    AND it.id = $3
    AND t.token = $4;`,
    values: [projectName, scenarioName, itemId, token]
  };
};

export const selectShareTokens = (projectName, scenarioName, itemId) => {
  return {
    text: `SELECT t.id, t.token, t.name FROM jtl.share_tokens as t
    LEFT JOIN jtl.items as it ON it.id = t.item_id
    LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
    LEFT JOIN jtl.projects as p ON p.id = s.project_id
    WHERE p.project_name = $1
    AND s.name = $2
    AND t.item_id = $3;`,
    values: [projectName, scenarioName, itemId]
  };
};

export const createShareToken = (projectName, scenarioName, itemId, token, name = null) => {
  return {
    text: `INSERT INTO jtl.share_tokens (item_id, token, name) VALUES (
      (SELECT it.id FROM jtl.items as it
      LEFT JOIN jtl.scenario as s ON s.id = it.scenario_id
      LEFT JOIN jtl.projects as p ON p.id = s.project_id
      WHERE p.project_name = $1
      AND s.name = $2
      AND it.id = $3), $4, $5);`,
    values: [projectName, scenarioName, itemId, token, name]
  };
};

export const deleteShareToken = (projectName, scenarioName, itemId, id) => {
  return {
    text: `DELETE FROM jtl.share_tokens as st
    USING jtl.scenario as sc
    WHERE st.id = $4
    AND st.item_id = $3
    AND sc.name = $2
    AND sc.project_id = (SELECT id FROM jtl.projects WHERE project_name = $1)`,
    values: [projectName, scenarioName, itemId, id]
  };
};

export const saveThresholdsResult = (projectName, scenarioName, itemId, threshold) => {
  return {
    text: `UPDATE jtl.items as it
    SET threshold_result = $4
    FROM jtl.scenario as s
    WHERE it.id = $1
    AND s.project_id = (SELECT id FROM jtl.projects WHERE project_name = $2)
    AND s.name = $3`,
    values: [itemId, projectName, scenarioName, threshold]
  };
};

export const upsertItemChartSettings = (itemId, userId, chartSetting) => {
  return {
    text: `INSERT INTO jtl.user_item_chart_settings as settings (item_id, user_id, chart_settings) VALUES ($1, $2, $3) 
    ON CONFLICT ON CONSTRAINT user_item_chart_settings_user_id_item_id_constraint 
    DO UPDATE SET chart_settings = $3 WHERE settings.item_id = $1 AND settings.user_id = $2`,
    values: [itemId, userId, chartSetting]
  };
};

export const getItemChartSettings = (itemId, userId) => {
  return {
    text: 'SELECT chart_settings as "settings" FROM jtl.user_item_chart_settings WHERE item_id = $1 AND user_id = $2;',
    values: [itemId, userId]
  };
};
