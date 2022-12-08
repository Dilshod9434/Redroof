import React, {useEffect, useState} from 'react'
import SearchForm from '../../Components/SearchForm/SearchForm.js'
import {useDispatch, useSelector} from 'react-redux'
import {motion} from 'framer-motion'
import {Link} from 'react-router-dom'
import {
    changeEndDate,
    changeStartDate,
    getConsumption,
    getIncomes,
} from './incomeConsumptionSlice'
import {roundUsd, roundUzs} from '../../App/globalFunctions'

const IncomeConsumption = () => {
    const dispatch = useDispatch()
    const {
        incomesCount,
        consumptionsCount,
        totalIncomes,
        totalIncomesUzs,
        totalConsumptions,
        totalConsumptionsUzs,
        startDate,
        endDate,
    } = useSelector((state) => state.income_consumption)

    const {currencyType} = useSelector((state) => state.currency)
    const {market} = useSelector((state) => state.login)

    const [incomes, setIncomes] = useState(0)
    const [incomesUzs, setIncomesUzs] = useState(0)
    const [expense, setExpense] = useState(0)
    const [expenseUzs, setExpenseUzs] = useState(0)

    const handleStartDate = (e) => {
        dispatch(changeStartDate({start: e.toISOString()}))
    }
    const handleEndDate = (e) => {
        dispatch(changeEndDate({end: e.toISOString()}))
    }

    useEffect(() => {
        dispatch(
            getIncomes({
                startDate,
                endDate,
                currentPage: 0,
                countPage: 10,
                market: market._id,
            })
        )
    }, [dispatch, startDate, endDate, market])

    useEffect(() => {
        dispatch(
            getConsumption({
                startDate,
                endDate,
                currentPage: 0,
                countPage: 10,
                market: market._id,
            })
        )
    }, [dispatch, startDate, endDate, market])

    useEffect(() => {
        setIncomes(totalIncomes)
        setIncomesUzs(totalIncomesUzs)
    }, [totalIncomes, totalIncomesUzs])

    useEffect(() => {
        setExpense(totalConsumptions)
        setExpenseUzs(totalConsumptionsUzs)
    }, [totalConsumptions, totalConsumptionsUzs])

    return (
        <motion.section
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
                open: {opacity: 1, height: 'auto'},
                collapsed: {opacity: 0, height: 0},
            }}
            transition={{duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98]}}
        >
            <SearchForm
                filterBy={['startDate', 'endDate']}
                startDate={new Date(startDate)}
                endDate={new Date(endDate)}
                setStartDate={handleStartDate}
                setEndDate={handleEndDate}
            />
            <Link
                to={'/income_consumption/total'}
                className='flex justify-center items-center text-center mainPadding'
            >
                <div>
                    <span className='cardContainer tradeCard w-[300px]'>
                        <span className='tradeIn'>
                            <span className='w-full'>
                                <span className={'checkName'}>
                                    <p className='text-[1.5rem]'>Umumiy</p>
                                    <p className='text-[1.25rem] '>
                                        {currencyType}
                                    </p>
                                </span>
                                <div>
                                    <p className='costCard float-right'>
                                        {currencyType === 'USD'
                                            ? roundUsd(
                                                  incomes - expense
                                              ).toLocaleString('ru-RU')
                                            : roundUzs(
                                                  incomesUzs - expenseUzs
                                              ).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                            </span>
                        </span>
                    </span>
                </div>
            </Link>
            <div className='flex items-center gap-[1.5rem] w-full mainPadding'>
                <Link to='/income_consumption/income' className='w-full'>
                    <span className='cardContainer returnedCard w-full'>
                        <span className='tradeIn'>
                            <span className={'parcentageWidth'}>
                                <span className={'percentageCircle'}>
                                    <span>{incomesCount}</span>
                                </span>
                            </span>
                            <span className='w-full'>
                                <span className={'checkName'}>
                                    <p className='text-[1.5rem]'>Kirim</p>
                                    <p className='text-[1.25rem] '>
                                        {currencyType}
                                    </p>
                                </span>
                                <div>
                                    <p className='costCard float-right'>
                                        {currencyType === 'USD'
                                            ? roundUsd(incomes).toLocaleString(
                                                  'ru-RU'
                                              )
                                            : roundUzs(
                                                  incomesUzs
                                              ).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                            </span>
                        </span>
                    </span>
                </Link>
                <Link to='/income_consumption/consumption' className='w-full'>
                    <span className='cardContainer debts w-full'>
                        <span className='tradeIn'>
                            <span className={'parcentageWidth'}>
                                <span className={'percentageCircle'}>
                                    <span>{consumptionsCount}</span>
                                </span>
                            </span>
                            <span className='w-full'>
                                <span className={'checkName'}>
                                    <p className='text-[1.5rem]'>Chiqim</p>
                                    <p className='text-[1.25rem] '>
                                        {currencyType}
                                    </p>
                                </span>
                                <div>
                                    <p className='costCard float-right'>
                                        {currencyType === 'USD'
                                            ? roundUsd(expense).toLocaleString(
                                                  'ru-RU'
                                              )
                                            : roundUzs(
                                                  expenseUzs
                                              ).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                            </span>
                        </span>
                    </span>
                </Link>
            </div>
        </motion.section>
    )
}

export default IncomeConsumption
