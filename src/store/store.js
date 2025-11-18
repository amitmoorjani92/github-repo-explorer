import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import repositoriesReducer from "./slices/repositoriesSlice";
import statsReducer from "./slices/statsSlice";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    repositories: repositoriesReducer,
    stats: statsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
