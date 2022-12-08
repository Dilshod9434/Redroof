import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import FieldContainer from '../../Components/FieldContainer/FieldContainer'
import Button from '../../Components/Buttons/BtnAddRemove'
import SearchForm from '../../Components/SearchForm/SearchForm'
import Pagination from '../../Components/Pagination/Pagination'
import Table from '../../Components/Table/Table'
import {universalToast} from '../../Components/ToastMessages/ToastMessages'
import {useTranslation} from 'react-i18next'
import {UsdToUzs, UzsToUsd} from './../../App/globalFunctions'
import {
    changeEndDate,
    changeStartDate,
    createIncome,
    deleteIncome,
    getIncomeNames,
    getIncomes,
    updateIncome,
} from './incomeConsumptionSlice'
import {BiPlus} from 'react-icons/bi'
import UniversalModal from '../../Components/Modal/UniversalModal'
import {useNavigate} from 'react-router-dom'

const Income = () => {
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {
        market: {_id},
    } = useSelector((state) => state.login)
    const {currencyType, currency} = useSelector((state) => state.currency)
    const {incomes, incomesCount, incomeNames, startDate, endDate} =
        useSelector((state) => state.income_consumption)
    const [currentPage, setCurrentPage] = useState(0)
    const [countPage, setCountPage] = useState(10)

    const [incomeSumm, setIncomeSumm] = useState('')
    const [incomeSummUzs, setIncomeSummUzs] = useState('')
    const [incomeName, setIncomeName] = useState(null)
    const [incomeType, setIncomeType] = useState(null)
    const [incomeNamesOption, setIncomeNamesOption] = useState([])
    const [incomeId, setIncomeId] = useState(null)
    const [incomeNameSearch, setIncomeNameSearch] = useState(null)
    const [comment, setComment] = useState('')

    const [modalVisible, setModalVisible] = useState(false)

    const types = [
        {
            label: t('Naqd'),
            value: 'cash',
        },
        {
            label: t('Plastik'),
            value: 'card',
        },
        {
            label: t("O'tkazma"),
            value: 'transfer',
        },
    ]

    const handleChangeIncomeName = (e) => {
        setIncomeName(e)
    }

    const handleChangeIncomeType = (e) => {
        setIncomeType(e)
    }

    const handleChangeInput = (e) => {
        if (currencyType === 'USD') {
            setIncomeSumm(Number(e.target.value) || '')
            setIncomeSummUzs(UsdToUzs(Number(e.target.value), currency))
        } else {
            setIncomeSummUzs(Number(e.target.value) || '')
            setIncomeSumm(UzsToUsd(Number(e.target.value), currency))
        }
    }

    const checkIncome = () => {
        if (incomeSumm < 0.01) {
            return universalToast('Kirim narxini kiritin', 'warning')
        }
        if (!incomeName.value) {
            return universalToast('Kirim nomini kiriting', 'warning')
        }
        if (!incomeType.value) {
            return universalToast('Kirim turini kiriting', 'warning')
        }
        return false
    }

    const handleEdit = (income) => {
        setIncomeName({
            label: income.incomeName.name,
            value: income.incomeName._id,
        })
        setIncomeSumm(income.totalprice)
        setIncomeSummUzs(income.totalpriceuzs)
        setIncomeId(income._id)

        const type =
            (income.type === 'cash' && 'Naqd') ||
            (income.type === 'card' && 'Plastik') ||
            (income.type === 'transfer' && "O'tkazma")
        setIncomeType({
            label: type,
            value: income.type,
        })
    }

    const clearForm = () => {
        setIncomeName(null)
        setIncomeSumm('')
        setIncomeSummUzs('')
        setIncomeType(null)
        setIncomeId(null)
        setComment('')
    }

    const handleCreateIncome = (e) => {
        e.preventDefault()
        if (!checkIncome()) {
            if (!incomeId) {
                dispatch(
                    createIncome({
                        incomeName: incomeName.value,
                        totalprice: incomeSumm,
                        totalpriceuzs: incomeSummUzs,
                        type: incomeType.value,
                        comment: comment,
                    })
                ).then(({error}) => {
                    if (!error) {
                        universalToast('Kirim yaratildi!', 'success')
                        clearForm()
                        window.location.reload()
                    }
                })
            } else {
                dispatch(
                    updateIncome({
                        _id: incomeId,
                        incomeName: incomeName.value,
                        totalprice: incomeSumm,
                        totalpriceuzs: incomeSummUzs,
                        type: incomeType.value,
                        comment: comment,
                    })
                ).then(({error}) => {
                    if (!error) {
                        universalToast('Kirim uzgardi!', 'success')
                        clearForm()
                    }
                })
            }
        }
    }

    const toggleModal = () => {
        setModalVisible(!modalVisible)
        setTimeout(() => {
            setIncomeId(null)
        }, 500)
    }

    const handleDeleteIncome = (id) => {
        setIncomeId(id)
        setModalVisible(!modalVisible)
    }

    const handleClickApproveToDelete = () => {
        dispatch(deleteIncome(incomeId)).then(({error}) => {
            if (!error) {
                setIncomeId(null)
                toggleModal()
                universalToast("Kirim o'chirildi!", 'success')
            }
        })
    }

    const headers = [
        {
            title: '№',
            styles: 'w-[7%]',
        },
        {
            title: t('Sana'),
            styles: 'w-[10%]',
            filter: 'createdAt',
        },
        {
            title: t('Summa'),
            styles: 'w-[20%]',
        },
        {
            title: t('Nomi'),
        },
        {
            title: t('Izoh'),
        },
        {
            title: t('Turi'),
        },
        {
            title: '',
            styles: 'w-[5%]',
        },
    ]

    useEffect(() => {
        dispatch(
            getIncomes({
                startDate,
                endDate,
                currentPage: currentPage,
                countPage: countPage,
                market: _id,
                incomeName: incomeNameSearch?.value,
            })
        )
    }, [
        dispatch,
        startDate,
        endDate,
        _id,
        currentPage,
        countPage,
        incomeNameSearch,
    ])

    useEffect(() => {
        dispatch(getIncomeNames(_id))
    }, [dispatch, _id])

    useEffect(() => {
        if (incomeNames && incomeNames.length > 0) {
            setIncomeNamesOption([
                ...incomeNames.map((el) => ({
                    label: el.name,
                    value: el._id,
                })),
            ])
        }
    }, [incomeNames])

    return (
        <div className='pt-[1rem]'>
            <div className='flex items-center gap-[1.25rem] mainPadding'>
                <FieldContainer
                    value={currencyType === 'USD' ? incomeSumm : incomeSummUzs}
                    onChange={handleChangeInput}
                    label={t('Narxi')}
                    placeholder={'misol: 100'}
                    maxWidth={'w-[21.75rem]'}
                    type={'number'}
                    border={true}
                    // onKeyUp={onKeyCreate}
                />
                <FieldContainer
                    value={incomeName}
                    onChange={handleChangeIncomeName}
                    label={'Kirim nomi'}
                    placeholder={'misol: soliq uchun'}
                    maxWidth={'w-[21.75rem]'}
                    options={incomeNamesOption}
                    border={true}
                    select={true}
                    // onKeyUp={onKeyCreate}
                />
                <FieldContainer
                    value={incomeType}
                    onChange={handleChangeIncomeType}
                    label={t('Kirim turi')}
                    placeholder={t('misol: Plastik')}
                    select={true}
                    options={types}
                    maxWidth={'w-[21rem]'}
                    // onKeyUp={onKeyCreate}
                />
            </div>
            <div className='pl-[2.5rem]'>
                <FieldContainer
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    label={t('Izoh')}
                    placeholder={t('misol: soliq uchun')}
                    maxWidth={'w-[21rem]'}
                    // onKeyUp={onKeyCreate}
                />
            </div>
            <div className='mainPadding flex justify-between'>
                <div>
                    <button
                        onClick={() => {
                            navigate('/income_consumption/name')
                        }}
                        className={`bg-blue-500 hover:bg-blue-600 focus-visible:outline-none createElement`}
                    >
                        <div className='plusIcon'>
                            <BiPlus />
                        </div>
                        Yangi kirim nomini yaratish
                    </button>
                </div>
                <div className={'flex gap-[1.25rem] w-[19.5rem]'}>
                    <Button
                        onClick={handleCreateIncome}
                        add={handleCreateIncome}
                        text={t('Yangi kirim yaratish')}
                    />
                    <Button onClick={clearForm} text={t('Tozalash')} />
                </div>
            </div>
            <div className='mainPadding'>
                <Pagination
                    countPage={countPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalDatas={incomesCount}
                />
            </div>
            <UniversalModal
                headerText='Kirim o`chirishni tasdiqlaysizmi?'
                title={'O`chirilgan kirimni tiklashning imkoni mavjud emas!'}
                toggleModal={toggleModal}
                body={'approve'}
                approveFunction={handleClickApproveToDelete}
                isOpen={modalVisible}
            />
            <div className='pt-[0.625rem] pr-[1rem] flex items-center'>
                <SearchForm
                    filterBy={['total', 'startDate', 'endDate']}
                    setStartDate={(e) =>
                        dispatch(changeStartDate({start: e.toISOString()}))
                    }
                    setEndDate={(e) =>
                        dispatch(changeEndDate({end: e.toISOString()}))
                    }
                    filterByTotal={(e) => setCountPage(e.value)}
                    startDate={new Date(startDate)}
                    endDate={new Date(endDate)}
                />
                <div className='flex items-center'>
                    <label
                        className={
                            'text-blue-700 block leading-[1.125rem] mr-[1rem]'
                        }
                    >
                        Nomi:
                    </label>
                    <FieldContainer
                        select={true}
                        placeholder={'misol: soliq uchun'}
                        maxWidth={'w-[300px]'}
                        options={[
                            {
                                label: 'Xammasi',
                                value: null,
                            },
                            ...incomeNamesOption,
                        ]}
                        value={incomeNameSearch}
                        onChange={(e) => setIncomeNameSearch(e)}
                    />
                </div>
            </div>
            {incomes && (
                <div className='tableContainerPadding'>
                    <Table
                        page={'incomes'}
                        headers={headers}
                        data={incomes}
                        reports={false}
                        Delete={handleDeleteIncome}
                        currentPage={currentPage}
                        countPage={countPage}
                        currency={currencyType}
                        Edit={handleEdit}
                    />
                </div>
            )}
        </div>
    )
}

export default Income
