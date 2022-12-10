import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getExpenseProducts} from './productSlice'
import Pagination from '../../../Components/Pagination/Pagination'
import SearchForm from '../../../Components/SearchForm/SearchForm'
import Table from '../../../Components/Table/Table'
import UniversalModal from '../../../Components/Modal/UniversalModal'

const ExpenseProducts = () => {
    const {
        market: {_id},
    } = useSelector((state) => state.login)
    const {productExpense} = useSelector((state) => state.products)
    const dispatch = useDispatch()
    const [startDate, setStartDate] = useState(
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
        )
    )
    const [endDate, setEndDate] = useState(new Date())
    const [currentPage, setCurrentPage] = useState(0)
    const [countPage, setCountPage] = useState(10)
    const [productsForCheck, setProductsForCheck] = useState([])
    const [modalVisible, setModalVisible] = useState(false)

    const headers = [
        {
            title: '№',
        },
        {
            title: 'Sana',
        },
        {
            title: 'Turlarni soni',
        },
        {
            title: 'Umumiy narxi',
        },
        {
            title: '',
        },
    ]

    const handleClickPrint = (products) => {
        setProductsForCheck(products)
        setModalVisible(true)
    }

    const toggleModal = () => {
        setModalVisible(!modalVisible)
        setProductsForCheck(null)
    }

    useEffect(() => {
        dispatch(
            getExpenseProducts({
                startDate,
                endDate,
                currentPage,
                countPage,
                market: _id,
            })
        )
    }, [dispatch, startDate, endDate, currentPage, countPage, _id])

    return (
        <div>
            <div className='pagination w-full flex justify-end pt-[32px] mainPadding'>
                <Pagination
                    countPage={Number(countPage)}
                    totalDatas={productExpense?.count}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
            <SearchForm
                filterBy={['total', 'startDate', 'endDate']}
                filterByTotal={({value}) => {
                    setCountPage(value)
                    setCurrentPage(0)
                }}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
            />
            <UniversalModal
                product={productsForCheck}
                body={'expenseProducts'}
                isOpen={modalVisible}
                toggleModal={toggleModal}
            />
            <div className='tableContainerPadding'>
                {productExpense &&
                    productExpense.expenseProducts.length > 0 && (
                        <Table
                            data={productExpense.expenseProducts}
                            currentPage={currentPage}
                            countPage={countPage}
                            page={'expenseProducts'}
                            headers={headers}
                            Print={handleClickPrint}
                        />
                    )}
            </div>
        </div>
    )
}

export default ExpenseProducts
