import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { roundUsd, roundUzs } from '../../App/globalFunctions'
import Dates from '../../Components/Dates/Dates'
import FilterButtons from '../../Components/FilterButtons/FilterButtons'
import SelectInput from '../../Components/SelectInput/SelectInput'
import {
    changeEndDate,
    changeStartDate,
    getTotalIncomeConsumption,
} from './incomeConsumptionSlice'
import IncomeConsumptionTable from './Table/IncomeConsumptionTable'
import { useDownloadExcel } from 'react-export-table-to-excel'
import ExportBtn from '../../Components/Buttons/ExportBtn'
import TableExcel from './Table/TableExcel'

const TotalIncomeConsumption = () => {
    const dispatch = useDispatch()
    const {
        market: { _id },
    } = useSelector((state) => state.login)
    const { currencyType } = useSelector((state) => state.currency)
    const { startDate, endDate, totalData, current } = useSelector(
        (state) => state.income_consumption
    )
    const [type, setType] = useState({
        label: 'Kirimlar',
        value: 'incomes',
    })

    const [tableHeader, setTableHeader] = useState([])

    useEffect(() => {
        dispatch(
            getTotalIncomeConsumption({
                startDate,
                endDate,
                market: _id,
                type: type?.value,
            })
        )
    }, [dispatch, startDate, endDate, type, _id])

    useEffect(() => {
        if (totalData && totalData.length > 0) {
            setTableHeader([
                {
                    title: '',
                },
                ...totalData.map((el) => ({
                    title: el.name,
                })),
            ])
        }
    }, [totalData])

    const tableRef = useRef(null)
    const { onDownload } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: 'Kirim_Chiqim',
        sheet: 'Users',
    })

    return (
        <div>
            <div className='mainPadding flex items-center gap-[1.125rem]'>
                <FilterButtons
                    key={'start_date_1'}
                    label={'Boshlang`ich sana'}
                    element={
                        <Dates
                            value={new Date(startDate)}
                            onChange={(e) =>
                                dispatch(
                                    changeStartDate({ start: e.toISOString() })
                                )
                            }
                            placeholder={'01.01.2021'}
                            maxWidth={'w-[6.625rem]'}
                        />
                    }
                />
                <FilterButtons
                    key={'end_date_1'}
                    label={'Tugash sana'}
                    element={
                        <Dates
                            value={new Date(endDate)}
                            onChange={(e) =>
                                dispatch(changeEndDate({ end: e.toISOString() }))
                            }
                            placeholder={'05.06.2022'}
                            maxWidth={'w-[6.625rem]'}
                        />
                    }
                />
                <FilterButtons
                    label={'Nomlari'}
                    element={
                        <SelectInput
                            options={[
                                {
                                    label: 'Kirimlar',
                                    value: 'incomes',
                                },
                                {
                                    label: 'Chiqimlar',
                                    value: 'consumptions',
                                },
                            ]}
                            value={type}
                            onSelect={(e) => setType(e)}
                        />
                    }
                />
                <ExportBtn onClick={onDownload} />
            </div>
            {totalData && totalData.length > 0 && (
                <div className='tableContainerPadding overflow-x-scroll'>
                    <IncomeConsumptionTable
                        header={tableHeader}
                        data={totalData}
                        type={type}
                    />
                </div>
            )}
            {totalData && totalData.length > 0 && (
                <div className='hidden'>
                    <TableExcel
                        data={totalData}
                        tableRef={tableRef}
                        current={current}
                    />
                </div>
            )}
        </div>
    )
}

export default TotalIncomeConsumption
