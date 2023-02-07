import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { universalToast } from '../../Components/ToastMessages/ToastMessages'
import Api from '../../Config/Api'

export const getIncomes = createAsyncThunk(
    'income/get',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.get('/income/get', {
                params: body,
            })
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const getConsumption = createAsyncThunk(
    'consumption/get',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.post('/consumption/get', body)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const getIncomeNames = createAsyncThunk(
    'income/name',
    async (market, { rejectWithValue }) => {
        try {
            const { data } = await Api.get(
                `/income_consumption_name/get?market=${market}`
            )
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const createIncome = createAsyncThunk(
    'income/create',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.post('/income/create', body)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const createIncomeName = createAsyncThunk(
    'income_name/create',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.post(
                '/income_consumption_name/create',
                body
            )
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const createConsumption = createAsyncThunk(
    'consumption/create',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.post('/consumption/create', body)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const updateIncome = createAsyncThunk(
    'income/update',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.put('/income/update', body)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const updateIncomeName = createAsyncThunk(
    'income_name/update',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.put(
                '/income_consumption_name/update',
                body
            )
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const updateConsumption = createAsyncThunk(
    'consumption/update',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.put('/consumption/update', body)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const deleteIncome = createAsyncThunk(
    'income/delete',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await Api.delete(`/income/delete/${id}`)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const deleteConsumption = createAsyncThunk(
    'consumption/delete',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await Api.delete(`/consumption/delete/${id}`)
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

export const getTotalIncomeConsumption = createAsyncThunk(
    'total/get',
    async (body = {}, { rejectWithValue }) => {
        try {
            const { data } = await Api.get('/income_consumption_total/get', {
                params: body,
            })
            return data
        } catch (error) {
            rejectWithValue(error)
        }
    }
)

const incomeConsumptionSlice = createSlice({
    name: 'incomeConsumption',
    initialState: {
        totalData: null,
        incomes: null,
        incomeNames: null,
        consumptions: null,
        consumptionNames: null,
        current: null,
        incomesCount: 0,
        consumptionsCount: 0,
        totalIncomes: 0,
        totalIncomesUzs: 0,
        totalConsumptions: 0,
        totalConsumptionsUzs: 0,
        loading: false,
        error: null,
        startDate: new Date(
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate() - 1
            )
        ).toISOString(),
        endDate: new Date().toISOString(),
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        changeStartDate: (state, { payload }) => {
            state.startDate = payload.start
        },
        changeEndDate: (state, { payload }) => {
            state.endDate = payload.end
        },
    },
    extraReducers: {
        [getIncomes.pending]: (state) => {
            state.loading = true
        },
        [getIncomes.fulfilled]: (state, { payload }) => {
            state.incomesCount = payload.count
            state.totalIncomes = payload.totalprice
            state.totalIncomesUzs = payload.totalpriceuzs
            state.incomes = payload.incomes
            state.loading = false
        },
        [getIncomes.rejected]: (state, { payload }) => {
            universalToast(`${payload}`, 'error')
            state.loading = false
        },
        [getIncomeNames.pending]: (state) => {
            state.loading = true
        },
        [getIncomeNames.fulfilled]: (state, { payload }) => {
            state.incomeNames = payload
            state.loading = false
        },
        [getIncomeNames.rejected]: (state, { payload }) => {
            universalToast(`${payload}`, 'error')
            state.loading = false
        },
        [getConsumption.pending]: (state) => {
            state.loading = true
        },
        [getConsumption.fulfilled]: (state, { payload }) => {
            state.consumptionsCount = payload.count
            state.totalConsumptions = payload.totalprice
            state.totalConsumptionsUzs = payload.totalpriceuzs
            state.consumptions = payload.consumptions
            state.loading = false
        },
        [getConsumption.rejected]: (state, { payload }) => {
            universalToast(`${payload}`, 'error')
            state.loading = false
        },
        [getTotalIncomeConsumption.pending]: (state) => {
            state.loading = true
        },
        [getTotalIncomeConsumption.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.totalData = payload?.names
        },
        [getTotalIncomeConsumption.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [createIncome.pending]: (state) => {
            state.loading = true
        },
        [createIncome.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.incomes = [payload, ...state.incomes]
            state.totalIncomes = state.totalIncomes + payload.totalprice
            state.totalIncomesUzs =
                state.totalIncomesUzs + payload.totalpriceuzs
            state.incomesCount = state.incomesCount + 1
        },
        [createIncome.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [createIncomeName.pending]: (state) => {
            state.loading = true
        },
        [createIncomeName.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.incomeNames = [payload, ...state.incomeNames]
        },
        [createIncomeName.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [createConsumption.pending]: (state) => {
            state.loading = true
        },
        [createConsumption.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.consumptions = [payload, ...state.consumptions]
            state.totalConsumptions =
                state.totalConsumptions + payload.totalprice
            state.totalConsumptions =
                state.totalConsumptionsUzs + payload.totalpriceuzs
            state.consumptionsCount = state.consumptionsCount + 1
        },
        [createConsumption.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [updateIncome.pending]: (state) => {
            state.loading = true
        },
        [updateIncome.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.incomes = [
                ...state.incomes.map((income) => {
                    if (income._id === payload._id) {
                        return payload
                    } else {
                        return income
                    }
                }),
            ]
        },
        [updateIncome.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [updateIncomeName.pending]: (state) => {
            state.loading = true
        },
        [updateIncomeName.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.incomeNames = [
                ...state.incomeNames.map((income) => {
                    if (income._id === payload._id) {
                        return payload
                    } else {
                        return income
                    }
                }),
            ]
        },
        [updateIncomeName.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [updateConsumption.pending]: (state) => {
            state.loading = true
        },
        [updateConsumption.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.consumptions = [
                ...state.consumptions.map((consumption) => {
                    if (consumption._id === payload._id) {
                        return payload
                    } else {
                        return consumption
                    }
                }),
            ]
        },
        [updateConsumption.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [deleteIncome.pending]: (state) => {
            state.loading = true
        },
        [deleteIncome.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.incomes = [
                ...state.incomes.filter((income) => income._id !== payload),
            ]
        },
        [deleteIncome.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
        [deleteConsumption.pending]: (state) => {
            state.loading = true
        },
        [deleteConsumption.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.consumptions = [
                ...state.consumptions.filter((cons) => cons._id !== payload),
            ]
        },
        [deleteConsumption.rejected]: (state, { payload }) => {
            state.loading = false
            universalToast(`${payload}`, 'error')
        },
    },
})

export const { changeStartDate, changeEndDate } = incomeConsumptionSlice.actions
export default incomeConsumptionSlice.reducer
