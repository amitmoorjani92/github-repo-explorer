import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Pagination,
  Stack,
} from "@mui/material";
import { Star, ErrorOutline } from "@mui/icons-material";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import {
  fetchRepositoriesStart,
  setTimeRange,
  setPage,
} from "../store/slices/repositoriesSlice";
import { setSelectedRepo, fetchStatsStart } from "../store/slices/statsSlice";
import RepositoryStats from "./RepositoryStats";
import "./css/RepositoryList.css";

const RepositoryList = () => {
  const [openRepoId, setOpenRepoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const { items, loading, error, hasMore, timeRange, page, totalPages } =
    useSelector((state) => state.repositories);

  const { selectedRepo, statsLoading } = useSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchRepositoriesStart());
  }, [dispatch, timeRange, page]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      loading ||
      !hasMore
    ) {
      return;
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleTimeRangeChange = (days) => {
    dispatch(setTimeRange(days));
    setCurrentPage(1);
    dispatch(setPage(1));
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    dispatch(setPage(value));
    setOpenRepoId(null);
    dispatch(setSelectedRepo(null));
  };

  const handleRepoClick = (repo) => {
    const [owner, repoName] = repo.full_name.split("/");

    if (openRepoId === repo.id) {
      setOpenRepoId(null);
      dispatch(setSelectedRepo(null));
    } else {
      setOpenRepoId(repo.id);
      dispatch(setSelectedRepo(repo));
      dispatch(fetchStatsStart({ owner, repo: repoName }));
    }
  };

  const handleArrowClick = (e, repoId) => {
    e.stopPropagation();
    const repo = items.find((item) => item.id === repoId);
    if (repo) {
      handleRepoClick(repo);
    }
  };

  const formatTimeInterval = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Box className="repository-list-container">
      {/* Time Range Filter */}
      <Box className="time-range-filter">
        <Chip
          label="Last 1 Week"
          onClick={() => handleTimeRangeChange(7)}
          color={timeRange === 7 ? "primary" : "default"}
          className="repo-metric-chip"
        />
        <Chip
          label="Last 2 Weeks"
          onClick={() => handleTimeRangeChange(14)}
          color={timeRange === 14 ? "primary" : "default"}
          className="repo-metric-chip"
        />
        <Chip
          label="Last 1 Month"
          onClick={() => handleTimeRangeChange(30)}
          color={timeRange === 30 ? "primary" : "default"}
          className="repo-metric-chip"
        />
      </Box>

      {/* Page Header */}
      <Box className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Most Starred Repos
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Repositories List */}
      <Box className="repos-grid">
        {items.map((repo) => (
          <Box key={repo.id}>
            <Card className="repo-card">
              <CardContent className="repo-card-content">
                {/* Repository Avatar */}
                <Avatar src={repo.owner.avatar_url} className="repo-avatar" />

                {/* Repository Info */}
                <Box className="repo-info">
                  <Box className="repo-details">
                    <Box className="repo-header">
                      <Box className="repo-title-section">
                        <Typography variant="h6" className="repo-name">
                          {repo.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="repo-description"
                        >
                          {repo.description || "No description available"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Repository Metrics */}
                    <Box className="repo-metrics">
                      <Chip
                        icon={<Star />}
                        label={`${repo.stargazers_count} Stars`}
                        variant="outlined"
                        size="small"
                        className="repo-metric-chip"
                      />
                      <Chip
                        icon={<ErrorOutline />}
                        label={`${repo.open_issues_count} Issues`}
                        variant="outlined"
                        size="small"
                        className="repo-metric-chip"
                      />
                      <Typography variant="body2" className="repo-last-pushed">
                        Last pushed {formatTimeInterval(repo.pushed_at)} by{" "}
                        {repo.owner.login}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expand Arrow */}
                  <Box className="repo-arrow-button">
                    <IconButton
                      onClick={(e) => handleArrowClick(e, repo.id)}
                      aria-label={
                        openRepoId === repo.id
                          ? "Collapse charts"
                          : "Expand charts"
                      }
                    >
                      <ArrowForwardIosOutlinedIcon
                        className={`arrow-icon ${
                          openRepoId === repo.id ? "rotated" : ""
                        }`}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>

              {/* Charts Section */}
              <Collapse in={openRepoId === repo.id}>
                <Box className="chart-section">
                  {statsLoading && openRepoId === repo.id ? (
                    <Box className="loading-container">
                      <CircularProgress />
                    </Box>
                  ) : (
                    selectedRepo &&
                    selectedRepo.id === repo.id && <RepositoryStats />
                  )}
                </Box>
              </Collapse>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box className="pagination-container">
          <Stack spacing={2} className="pagination-stack">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          Page {currentPage} of {totalPages}
        </Typography>
      )}
    </Box>
  );
};

export default RepositoryList;
