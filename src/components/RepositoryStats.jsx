import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { setMetricType } from "../store/slices/statsSlice";
import "./css/RepositoryStats.css";

const RepositoryStats = () => {
  const dispatch = useDispatch();
  const {
    selectedRepo,
    codeFrequency,
    contributors,
    loading,
    error,
    metricType,
  } = useSelector((state) => state.stats);

  console.log("codeFrequency", codeFrequency);
  console.log("contributors", contributors);

  const handleMetricChange = (event) => {
    dispatch(setMetricType(event.target.value));
  };

  // Check if data is empty or null
  const hasCodeFrequencyData =
    codeFrequency && Array.isArray(codeFrequency) && codeFrequency.length > 0;
  const hasContributorsData =
    contributors && Array.isArray(contributors) && contributors.length > 0;
  const hasAnyData = hasCodeFrequencyData || hasContributorsData;

  // Tooltip formatter functions
  const getTotalChangesTooltip = function () {
    const weekStart = Highcharts.dateFormat("%b %e", this.x);
    const changes = this.point.additions + Math.abs(this.point.deletions);

    return `
      <div class="custom-tooltip">
        <div class="tooltip-title">Total Changes</div>
        <div class="tooltip-section">
          <span class="tooltip-label">Week:</span>
          <span class="tooltip-value">${weekStart}</span>
        </div>
        <div class="tooltip-section">
          <span class="tooltip-label">Changes:</span>
          <span class="tooltip-value">${changes}</span>
        </div>
        <div class="tooltip-metric tooltip-additions">
          <span class="metric-label additions-label">Additions</span>
          <span class="metric-count">${this.point.additions}</span>
        </div>
        <div class="tooltip-metric tooltip-deletions">
          <span class="metric-label deletions-label">Deletions</span>
          <span class="metric-count">${Math.abs(this.point.deletions)}</span>
        </div>
      </div>
    `;
  };

  const getContributorTooltip = function () {
    const weekStart = Highcharts.dateFormat("%b %e", this.point.x);
    const changes = this.point.additions + this.point.deletions;

    return `
      <div class="custom-tooltip">
        <div class="tooltip-title">Contributor Changes</div>
        <div class="tooltip-section">
          <span class="tooltip-label">Week:</span>
          <span class="tooltip-value">${weekStart}</span>
        </div>
        <div class="tooltip-section">
          <span class="tooltip-label">Changes:</span>
          <span class="tooltip-value">${changes}</span>
        </div>
        <div class="tooltip-section">
          <span class="tooltip-label">Contributor:</span>
          <span class="tooltip-value">${this.point.contributorName}</span>
        </div>
        <div class="tooltip-metric tooltip-additions">
          <span class="metric-label additions-label">Additions</span>
          <span class="metric-count">${this.point.additions}</span>
        </div>
        <div class="tooltip-metric tooltip-deletions">
          <span class="metric-label deletions-label">Deletions</span>
          <span class="metric-count">${this.point.deletions}</span>
        </div>
      </div>
    `;
  };

  const chartOptions = useMemo(() => {
    // Return null if no data available
    if (!hasAnyData) return { total: null, contributors: null };

    let totalChartOptions = null;
    let contributorsChartOptions = null;

    // Process code frequency data for total changes (if available)
    if (hasCodeFrequencyData) {
      const totalChangesData = Array.from(codeFrequency).map(
        ([timestamp, additions, deletions]) => {
          // Deletions come as negative numbers, convert to positive for display
          const absoluteDeletions = Math.abs(deletions);
          return {
            x: timestamp * 1000,
            additions: additions,
            deletions: absoluteDeletions, // Store as positive number
            originalDeletions: deletions, // Keep original for reference
            changes: additions + absoluteDeletions,
          };
        }
      );

      totalChartOptions = {
        chart: {
          type: "line",
          height: 300,
          style: {
            fontFamily: "inherit",
          },
        },
        title: {
          text: "Total Changes",
          style: { fontSize: "16px", fontWeight: "bold" },
        },
        xAxis: {
          type: "datetime",
          title: { text: "Week" },
          labels: {
            formatter: function () {
              return Highcharts.dateFormat("%b %e", this.value);
            },
          },
        },
        yAxis: {
          title: { text: "Number of Changes" },
          min: 0,
        },
        tooltip: {
          useHTML: true,
          formatter: getTotalChangesTooltip,
          backgroundColor: "transparent",
          borderWidth: 0,
          shadow: false,
        },
        series: [
          {
            name:
              metricType === "additions"
                ? "Additions"
                : metricType === "deletions"
                ? "Deletions"
                : "Total Changes",
            data: totalChangesData.map((item) => {
              // Handle the metric type selection with proper values
              let yValue;
              switch (metricType) {
                case "additions":
                  yValue = item.additions;
                  break;
                case "deletions":
                  yValue = item.deletions; // This is now positive
                  break;
                case "changes":
                default:
                  yValue = item.changes;
                  break;
              }

              return {
                x: item.x,
                y: yValue,
                additions: item.additions,
                deletions: item.deletions, // Positive value for tooltip
                changes: item.changes,
              };
            }),
            color:
              metricType === "additions"
                ? "#2e7d32"
                : metricType === "deletions"
                ? "#c62828"
                : "#1976d2",
          },
        ],
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 768,
              },
              chartOptions: {
                chart: {
                  height: 250,
                },
                legend: {
                  enabled: false,
                },
              },
            },
            {
              condition: {
                maxWidth: 480,
              },
              chartOptions: {
                chart: {
                  height: 200,
                },
                title: {
                  style: {
                    fontSize: "14px",
                  },
                },
              },
            },
          ],
        },
      };
    }

    // Process contributors data (if available)
    if (hasContributorsData) {
      const contributorSeries = Array.from(contributors).map(
        (contributor, index) => {
          const weeks = contributor.weeks || [];
          return {
            name: contributor.author?.login || `Contributor ${index + 1}`,
            data: weeks.map((week) => {
              // For contributors data, deletions are already positive (week.d)
              let yValue;
              switch (metricType) {
                case "additions":
                  yValue = week.a;
                  break;
                case "deletions":
                  yValue = week.d;
                  break;
                case "changes":
                default:
                  yValue = week.a + week.d;
                  break;
              }

              return {
                x: new Date(week.w * 1000).getTime(),
                y: yValue,
                additions: week.a,
                deletions: week.d,
                changes: week.a + week.d,
                contributorName:
                  contributor.author?.login || `Contributor ${index + 1}`,
              };
            }),
            visible: index < 5,
          };
        }
      );

      contributorsChartOptions = {
        chart: {
          type: "line",
          height: 400,
          marginRight: 200,
          style: {
            fontFamily: "inherit",
          },
        },
        title: {
          text: "Contributor Changes",
          style: { fontSize: "16px", fontWeight: "bold" },
        },
        xAxis: {
          type: "datetime",
          title: { text: "Week" },
          labels: {
            formatter: function () {
              return Highcharts.dateFormat("%b %e", this.value);
            },
          },
        },
        yAxis: {
          title: { text: "Number of Changes" },
          min: 0,
        },
        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
          itemMarginTop: 8,
          itemMarginBottom: 8,
          symbolHeight: 10,
          symbolWidth: 10,
          symbolRadius: 5,
          itemStyle: {
            fontSize: "12px",
            fontWeight: "normal",
          },
        },
        tooltip: {
          useHTML: true,
          formatter: getContributorTooltip,
          backgroundColor: "transparent",
          borderWidth: 0,
          shadow: false,
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false,
              radius: 2,
            },
            lineWidth: 2,
          },
        },
        series: contributorSeries,
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 1024,
              },
              chartOptions: {
                chart: {
                  marginRight: 150,
                },
                legend: {
                  itemStyle: {
                    fontSize: "11px",
                  },
                },
              },
            },
            {
              condition: {
                maxWidth: 768,
              },
              chartOptions: {
                chart: {
                  height: 350,
                  marginRight: 120,
                },
                legend: {
                  itemStyle: {
                    fontSize: "10px",
                  },
                },
              },
            },
            {
              condition: {
                maxWidth: 480,
              },
              chartOptions: {
                chart: {
                  height: 300,
                  marginRight: 0,
                },
                legend: {
                  enabled: false,
                },
                title: {
                  style: {
                    fontSize: "14px",
                  },
                },
              },
            },
          ],
        },
      };
    }

    return { total: totalChartOptions, contributors: contributorsChartOptions };
  }, [
    codeFrequency,
    contributors,
    metricType,
    hasAnyData,
    hasCodeFrequencyData,
    hasContributorsData,
  ]);

  if (!selectedRepo) return null;

  if (error) {
    return (
      <Box className="repository-stats-container">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="repository-stats-container">
      <Box className="stats-header">
        <FormControl className="metric-selector">
          <Select value={metricType} onChange={handleMetricChange} displayEmpty>
            <MenuItem value="changes">Total Changes</MenuItem>
            <MenuItem value="additions">Additions</MenuItem>
            <MenuItem value="deletions">Deletions</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      )}

      {/* Show message when no data is available */}
      {!loading && !hasAnyData && (
        <Card className="chart-card">
          <CardContent className="chart-content">
            <Box className="no-data-message">
              <Typography
                variant="h6"
                color="text.secondary"
                align="center"
                gutterBottom
              >
                No Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {!hasCodeFrequencyData && !hasContributorsData
                  ? "No code frequency or contributor data available for this repository."
                  : !hasCodeFrequencyData
                  ? "No code frequency data available for this repository."
                  : "No contributor data available for this repository."}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Show available charts */}
      {!loading && hasAnyData && (
        <Box className="charts-grid">
          {/* Total Changes Chart */}
          {chartOptions.total ? (
            <Card className="chart-card">
              <CardContent className="chart-content">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions.total}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="chart-card">
              <CardContent className="chart-content">
                <Box className="no-data-message">
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    align="center"
                    gutterBottom
                  >
                    No Total Changes Data
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Code frequency data is not available for this repository.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Contributors Chart */}
          {chartOptions.contributors ? (
            <Card className="chart-card">
              <CardContent className="chart-content">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartOptions.contributors}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="chart-card">
              <CardContent className="chart-content">
                <Box className="no-data-message">
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    align="center"
                    gutterBottom
                  >
                    No Contributor Data
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Contributor statistics are not available for this
                    repository.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RepositoryStats;
