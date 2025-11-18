// store/slices/statsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    selectedRepo: null,
    codeFrequency: null,
    commitActivity: null,
    contributors: null,
    loading: false,
    error: null,
    metricType: "changes", // changes, additions, deletions
  },
  reducers: {
    fetchStatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action) => {
      state.loading = false;
      const { type, data } = action.payload;
      state[type] = data;
    },
    fetchStatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedRepo: (state, action) => {
      state.selectedRepo = action.payload;
    },
    setMetricType: (state, action) => {
      state.metricType = action.payload;
    },
    clearStats: (state) => {
      state.selectedRepo = null;
      state.codeFrequency = null;
      state.commitActivity = null;
      state.contributors = null;
    },
  },
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  setSelectedRepo,
  setMetricType,
  clearStats,
} = statsSlice.actions;

export default statsSlice.reducer;
