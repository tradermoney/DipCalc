import React from 'react';
import {
  Box,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

import { usePnLPageState } from './hooks/usePnLPageState';
import { usePnLPageActions } from './hooks/usePnLPageActions';
import { PnLPageHeader } from './components/PnLPageHeader';
import { StrategyList } from './components/StrategyList';
import { PnLPageInfo } from './components/PnLPageInfo';
import { SpotTradeTable } from './components';
import { PnLResults } from './components/PnLResults';
import { PnLPageInstructions } from './components/PnLPageInstructions';

export const PnLPage: React.FC = () => {
  // Use state management hook
  const state = usePnLPageState();

  // Extract state
  const {
    params,
    result,
    errors,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    isCalculating,
    showStrategyList,
    currentStrategyId,
    inputValues,
    isSaving,
    lastSaved,
    setParams,
    setResult,
    setErrors,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    setIsCalculating,
    setShowStrategyList,
    setCurrentStrategyId,
    setInputValues,
    deleteDraft
  } = state;

  // Use actions hook
  const actions = usePnLPageActions({
    params,
    inputValues,
    setParams,
    setResult,
    setErrors,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    setIsCalculating,
    setInputValues,
    setCurrentStrategyId,
    deleteDraft
  });

  const {
    generateId,
    getInputValue,
    handleInputChange,
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    handleAddTrade,
    handleInsertTrade,
    handleRemoveTrade,
    handleUpdateTrade,
    handleDragEnd,
    handleCalculate,
    handleClear,
    handleSave,
    handleLoadStrategy,
    handleSnackbarClose
  } = actions;

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle param changes
  const handleParamChange = (field: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));
  };

  return (
    <Box>
      {/* Header */}
      <PnLPageHeader
        showStrategyList={showStrategyList}
        isCalculating={isCalculating}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onToggleStrategyList={() => setShowStrategyList(!showStrategyList)}
        onClear={handleClear}
        onSave={handleSave}
        onCalculate={handleCalculate}
      />

      <Grid container spacing={3}>
        {/* Strategy List - Collapsible */}
        <Grid item xs={12}>
          {showStrategyList && (
            <StrategyList
              onLoadStrategy={handleLoadStrategy}
              currentStrategyId={currentStrategyId}
            />
          )}
        </Grid>

        {/* Trading Pair Info */}
        <Grid item xs={12}>
          <PnLPageInfo
            params={{
              symbol: params.symbol || '',
              currentPrice: params.currentPrice || 0
            }}
            errors={errors}
            onParamChange={handleParamChange}
          />
        </Grid>

        {/* Trading Table */}
        <Grid item xs={12}>
          <SpotTradeTable
            trades={params.trades || []}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onAddTrade={handleAddTrade}
            insertTrade={handleInsertTrade}
            removeTrade={handleRemoveTrade}
            updateTrade={handleUpdateTrade}
            getInputValue={getInputValue}
            handleInputChange={handleInputChange}
            registerInputRef={registerInputRef}
            handleInputFocus={handleInputFocus}
            handleInputBlur={handleInputBlur}
          />
        </Grid>

        {/* Results */}
        <Grid item xs={12}>
          <PnLResults
            result={result}
            symbol={params.symbol || 'N/A'}
          />
        </Grid>
      </Grid>

      {/* Instructions */}
      <Box mt={3}>
        <PnLPageInstructions />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
