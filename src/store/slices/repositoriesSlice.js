// import { createSlice } from "@reduxjs/toolkit";

// const repositoriesSlice = createSlice({
//   name: "repositories",
//   initialState: {
//     items: [],
//     loading: false,
//     error: null,
//     page: 1,
//     hasMore: true,
//     timeRange: 30, // days
//   },
//   reducers: {
//     fetchRepositoriesStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     fetchRepositoriesSuccess: (state, action) => {
//       state.loading = false;
//       state.items = [...state.items, ...action.payload.items];
//       state.hasMore = action.payload.items.length > 0;
//       state.page += 1;
//     },
//     fetchRepositoriesFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     setTimeRange: (state, action) => {
//       state.timeRange = action.payload;
//       state.items = [];
//       state.page = 1;
//       state.hasMore = true;
//     },
//     resetRepositories: (state) => {
//       state.items = [];
//       state.page = 1;
//       state.hasMore = true;
//     },
//   },
// });

// export const {
//   fetchRepositoriesStart,
//   fetchRepositoriesSuccess,
//   fetchRepositoriesFailure,
//   setTimeRange,
//   resetRepositories,
// } = repositoriesSlice.actions;

// export default repositoriesSlice.reducer;

// In your repositoriesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const repositoriesSlice = createSlice({
  name: "repositories",
  initialState: {
    items: [],
    loading: false,
    error: null,
    hasMore: true,
    timeRange: 30,
    page: 1,
    totalPages: 0,
    totalCount: 0,
  },
  reducers: {
    fetchRepositoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // fetchRepositoriesSuccess: (state, action) => {
    //   state.loading = false;
    //   state.items = action.payload.items;
    //   state.totalCount = action.payload.total_count;
    //   state.totalPages = Math.ceil(action.payload.total_count / 30); // GitHub returns 30 items per page by default
    //   state.hasMore = state.page < state.totalPages;
    // },
    fetchRepositoriesSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.totalCount = action.payload.total_count;
      state.totalPages = action.payload.total_pages;
      state.hasMore = state.page < state.totalPages;
    },
    fetchRepositoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
      state.page = 1; // Reset to first page when time range changes
      state.items = []; // Clear previous items
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const {
  fetchRepositoriesStart,
  fetchRepositoriesSuccess,
  fetchRepositoriesFailure,
  setTimeRange,
  setPage,
} = repositoriesSlice.actions;

export default repositoriesSlice.reducer;
