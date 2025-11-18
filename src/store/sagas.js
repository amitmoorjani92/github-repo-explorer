// // store/sagas.js
// import { all, takeEvery, put, call, select } from "redux-saga/effects";
// import {
//   fetchRepositoriesStart,
//   fetchRepositoriesSuccess,
//   fetchRepositoriesFailure,
// } from "./slices/repositoriesSlice";
// import {
//   fetchStatsStart,
//   fetchStatsSuccess,
//   fetchStatsFailure,
// } from "./slices/statsSlice";

// function* fetchRepositoriesSaga() {
//   try {
//     const state = yield select();
//     const { page, timeRange } = state.repositories;

//     const sinceDate = new Date();
//     sinceDate.setDate(sinceDate.getDate() - timeRange);
//     const dateString = sinceDate.toISOString().split("T")[0];

//     const response = yield call(
//       fetch,
//       `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&page=${page}&per_page=100`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch repositories");
//     }

//     const data = yield response.json();
//     yield put(fetchRepositoriesSuccess(data));
//   } catch (error) {
//     yield put(fetchRepositoriesFailure(error.message));
//   }
// }

// function* fetchStatsSaga(action) {
//   try {
//     const { owner, repo } = action.payload;
//     // const state = yield select();
//     // const metricType = state.stats.metricType;

//     // Fetch code frequency data
//     const codeFrequencyResponse = yield call(
//       fetch,
//       `https://api.github.com/repos/${owner}/${repo}/stats/code_frequency`
//     );

//     // Fetch contributors data
//     const contributorsResponse = yield call(
//       fetch,
//       `https://api.github.com/repos/${owner}/${repo}/stats/contributors`
//     );

//     if (!codeFrequencyResponse.ok || !contributorsResponse.ok) {
//       throw new Error("Failed to fetch stats");
//     }

//     const codeFrequency = yield codeFrequencyResponse.json();
//     const contributors = yield contributorsResponse.json();

//     yield put(
//       fetchStatsSuccess({ type: "codeFrequency", data: codeFrequency })
//     );
//     yield put(fetchStatsSuccess({ type: "contributors", data: contributors }));
//   } catch (error) {
//     yield put(fetchStatsFailure(error.message));
//   }
// }

// function* watchFetchRepositories() {
//   yield takeEvery(fetchRepositoriesStart.type, fetchRepositoriesSaga);
// }

// function* watchFetchStats() {
//   yield takeEvery(fetchStatsStart.type, fetchStatsSaga);
// }

// export default function* rootSaga() {
//   yield all([watchFetchRepositories(), watchFetchStats()]);
// }

// store/sagas.js
import { all, takeEvery, put, call, select } from "redux-saga/effects";
import {
  fetchRepositoriesStart,
  fetchRepositoriesSuccess,
  fetchRepositoriesFailure,
} from "./slices/repositoriesSlice";
import {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
} from "./slices/statsSlice";

// function* fetchRepositoriesSaga() {
//   try {
//     const state = yield select();
//     const { page, timeRange } = state.repositories;

//     const sinceDate = new Date();
//     sinceDate.setDate(sinceDate.getDate() - timeRange);
//     const dateString = sinceDate.toISOString().split("T")[0];

//     const response = yield call(
//       fetch,
//       `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&page=${page}&per_page=30`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch repositories");
//     }

//     const data = yield response.json();

//     // Calculate total pages based on GitHub's 1000 result limit
//     const totalCount = Math.min(data.total_count, 1000); // GitHub API returns max 1000 results
//     const totalPages = Math.ceil(totalCount / 30);

//     yield put(
//       fetchRepositoriesSuccess({
//         items: data.items,
//         total_count: totalCount,
//         total_pages: totalPages,
//       })
//     );
//   } catch (error) {
//     yield put(fetchRepositoriesFailure(error.message));
//   }
// }
function* fetchRepositoriesSaga() {
  try {
    const state = yield select();
    const { page, timeRange } = state.repositories;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - timeRange);
    const dateString = sinceDate.toISOString().split("T")[0];

    const response = yield call(
      fetch,
      `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&page=${page}&per_page=100`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const data = yield response.json();

    // Calculate total pages based on GitHub's 1000 result limit
    // const totalCount = Math.min(data.total_count, 1000);
    const totalCount = data.total_count;
    const totalPages = Math.ceil(totalCount / 100); // Changed to 100

    yield put(
      fetchRepositoriesSuccess({
        items: data.items,
        total_count: totalCount,
        total_pages: totalPages,
      })
    );
  } catch (error) {
    yield put(fetchRepositoriesFailure(error.message));
  }
}

function* fetchStatsSaga(action) {
  try {
    const { owner, repo } = action.payload;

    // Fetch code frequency data
    const codeFrequencyResponse = yield call(
      fetch,
      `https://api.github.com/repos/${owner}/${repo}/stats/code_frequency`
    );

    // Fetch contributors data
    const contributorsResponse = yield call(
      fetch,
      `https://api.github.com/repos/${owner}/${repo}/stats/contributors`
    );

    if (!codeFrequencyResponse.ok || !contributorsResponse.ok) {
      throw new Error("Failed to fetch stats");
    }

    const codeFrequency = yield codeFrequencyResponse.json();
    const contributors = yield contributorsResponse.json();

    yield put(
      fetchStatsSuccess({
        type: "codeFrequency",
        data: codeFrequency,
      })
    );
    yield put(
      fetchStatsSuccess({
        type: "contributors",
        data: contributors,
      })
    );
  } catch (error) {
    yield put(fetchStatsFailure(error.message));
  }
}

function* watchFetchRepositories() {
  yield takeEvery(fetchRepositoriesStart.type, fetchRepositoriesSaga);
}

function* watchFetchStats() {
  yield takeEvery(fetchStatsStart.type, fetchStatsSaga);
}

export default function* rootSaga() {
  yield all([watchFetchRepositories(), watchFetchStats()]);
}
