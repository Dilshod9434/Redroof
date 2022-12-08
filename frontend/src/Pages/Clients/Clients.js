import React, {useEffect, useState} from 'react'
import FieldContainer from '../../Components/FieldContainer/FieldContainer'
import Button from '../../Components/Buttons/BtnAddRemove'
import Pagination from '../../Components/Pagination/Pagination'
import Table from '../../Components/Table/Table'
import {useDispatch, useSelector} from 'react-redux'
import Spinner from '../../Components/Spinner/SmallLoader.js'
import NotFind from '../../Components/NotFind/NotFind.js'
import SearchForm from '../../Components/SearchForm/SearchForm'
import UniversalModal from '../../Components/Modal/UniversalModal.js'
import {motion} from 'framer-motion'
import {filter, map} from 'lodash'
import {
    successAddSupplierMessage,
    successDeleteSupplierMessage,
    successUpdateSupplierMessage,
    universalToast,
    warningEmptyInput,
} from '../../Components/ToastMessages/ToastMessages.js'
import {
    addClients,
    clearSearchedClients,
    deleteClients,
    getAllPackmans,
    getClients,
    getClientsByFilter,
    updateClients,
} from './clientsSlice'
import {
    checkEmptyString,
    UsdToUzs,
    UzsToUsd,
} from '../../App/globalFunctions.js'
import {useTranslation} from 'react-i18next'

const ClientsPage = () => {
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()

    const {packmans, clients, loading, searchedClients, total, totalSearched} =
        useSelector((state) => state.clients)
    const {currency, currencyType} = useSelector((state) => state.currency)

    const headers = [
        {title: '№', styles: 'w-[8%] text-left'},
        {title: t('Mijoz'), styles: 'w-[41%] text-left'},
        {title: 'Oldindan tulov'},
        {title: 'Qarz'},
        {title: '', styles: 'w-[8%] text-left'},
    ]

    const prePaymentTypes = [
        {
            label: 'Naqd',
            value: 'cash',
        },
        {
            label: 'Plastik',
            value: 'card',
        },
        {
            label: "O'tkazma",
            value: 'transfer',
        },
    ]

    // states
    const [packmanOptions, setPackmanOptions] = useState([])
    const [data, setData] = useState([])
    const [searchedData, setSearchedData] = useState([])
    const [clientName, setClientName] = useState('')
    const [packman, setPackman] = useState(null)
    const [currentClient, setCurrentClient] = useState('')
    const [deletedCLients, setDeletedClients] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [stickyForm, setStickyForm] = useState(false)
    const [showByTotal, setShowByTotal] = useState('10')
    const [currentPage, setCurrentPage] = useState(0)
    const [filteredDataTotal, setFilteredDataTotal] = useState(total)
    const [searchByName, setSearchByName] = useState('')
    const [searchByDelivererName, setSearchByDelivererName] = useState('')
    const [printedSelling, setPrintedSelling] = useState(null)
    const [modalBody, setModalBody] = useState(null)
    const [prepayment, setPrepayment] = useState('')
    const [prepaymentUzs, setPrepaymentUzs] = useState('')
    const [prepaymentType, setPrepaymentType] = useState(null)

    // modal toggle
    const toggleModal = () => {
        setModalVisible(!modalVisible)
        setTimeout(() => {
            setDeletedClients(null)
        }, 500)
    }

    // handle change of input
    const handleChangeClientName = (e) => {
        setClientName(e.target.value)
    }
    // table edit and delete
    const handleEditClients = (client) => {
        setPackman(
            client.packman
                ? {label: client.packman.name, value: client.packman._id}
                : ''
        )
        setClientName(client.name || '')
        setCurrentClient(client)
        setStickyForm(true)
        setPrepayment(client?.prepayment || 0)
        setPrepaymentUzs(client?.prepaymentuzs || 0)
        setPrepaymentType(
            (client?.prepaymentType === 'cash' && {
                label: 'Naqd',
                value: 'cash',
            }) ||
                (client?.prepaymentType === 'card' && {
                    label: 'Plastik',
                    value: 'card',
                }) ||
                (client?.prepaymentType === 'transfer' && {
                    label: "O'tkazma",
                    value: 'transfer',
                }) ||
                null
        )
    }

    const handleDeleteClient = (client) => {
        setDeletedClients(client)
        setModalBody('approve')
        setModalVisible(true)
    }

    const handlePrint = (sale) => {
        setModalBody('allChecks')
        setPrintedSelling(sale)
        setModalVisible(true)
    }

    const handleClickApproveToDelete = () => {
        const body = {
            name: deletedCLients.name,
            _id: deletedCLients._id,
            packman: deletedCLients.packman,
            currentPage,
            countPage: showByTotal,
            search: {
                client: searchByName.replace(/\s+/g, ' ').trim(),
            },
        }
        dispatch(deleteClients(body)).then(({error}) => {
            if (!error) {
                clearForm()
                successDeleteSupplierMessage()
                getData()
            }
        })
        toggleModal()
    }

    const handleChangePrePayment = (e) => {
        let val = Number(e.target.value || 0)
        if (currencyType === 'USD') {
            setPrepayment(val)
            setPrepaymentUzs(UsdToUzs(val, currency))
        } else {
            setPrepaymentUzs(val)
            setPrepayment(UzsToUsd(val, currency))
        }
    }

    const getData = () => {
        const body = {
            currentPage,
            countPage: showByTotal,
            search: {
                client: searchByName.replace(/\s+/g, ' ').trim(),
                packman: searchByDelivererName.replace(/\s+/g, ' ').trim(),
            },
        }
        dispatch(getClients(body))
    }

    // handle submit of inputs
    const addNewClients = (e) => {
        e.preventDefault()
        const {failed, message} = checkEmptyString([
            {
                value: clientName,
                message: t('Mijoz ismi'),
            },
        ])
        if (failed) {
            warningEmptyInput(message)
        } else {
            const body = {
                name: clientName,
                packman: (packman && packman.value) || null,
                currentPage,
                countPage: showByTotal,
                search: {
                    client: searchByName.replace(/\s+/g, ' ').trim(),
                    packman: searchByDelivererName.replace(/\s+/g, ' ').trim(),
                },
            }
            if (prepayment > 0 && !prepaymentType) {
                return universalToast('Tulov turini tanlang', 'warning')
            }
            if (prepayment > 0 && prepaymentType) {
                body.prepayment = prepayment
                body.prepaymentuzs = prepaymentUzs
                body.prepaymentType = prepaymentType.value
            }
            dispatch(addClients(body)).then(({error}) => {
                if (!error) {
                    clearForm()
                    successAddSupplierMessage()
                    getData()
                }
            })
        }
    }
    const handleEdit = (e) => {
        e.preventDefault()
        const {failed, message} = checkEmptyString([
            {
                value: clientName,
                message: t('Mijoz ismi'),
            },
        ])
        if (failed) {
            warningEmptyInput(message)
        } else {
            const body = {
                name: clientName,
                _id: currentClient._id,
                packman: (packman && packman.value) || null,
                currentPage,
                countPage: showByTotal,
                search: {
                    client: searchByName.replace(/\s+/g, ' ').trim(),
                    packman: searchByDelivererName.replace(/\s+/g, ' ').trim(),
                },
            }
            if (prepayment > 0 && !prepaymentType) {
                return universalToast('Tulov turini tanlang', 'warning')
            }
            if (prepayment > 0 && prepaymentType) {
                body.prepayment = prepayment
                body.prepaymentuzs = prepaymentUzs
                body.prepaymentType = prepaymentType.value
            }
            dispatch(updateClients(body)).then(({error}) => {
                if (!error) {
                    clearForm()
                    successUpdateSupplierMessage()
                    getData()
                }
            })
        }
    }

    const clearForm = (e) => {
        e && e.preventDefault()
        setClientName('')
        setPackman(null)
        setStickyForm(false)
        setPrepayment('')
        setPrepaymentUzs('')
        setPrepaymentType(null)
    }

    // filter by total
    const filterByTotal = ({value}) => {
        setShowByTotal(value)
        setCurrentPage(0)
    }

    // handle change of search inputs
    const filterByClientName = (e) => {
        let val = e.target.value
        let valForSearch = val.toLowerCase().replace(/\s+/g, ' ').trim()
        setSearchByName(val)
        if (searchedData.length > 0 || totalSearched > 0)
            dispatch(clearSearchedClients())
        if (valForSearch === '') {
            setData(clients)
            setFilteredDataTotal(total)
        } else {
            const filteredClients = filter(clients, (client) => {
                return client.name.toLowerCase().includes(valForSearch)
            })
            setData(filteredClients)
            setFilteredDataTotal(filteredClients.length)
        }
    }

    const filterByDelivererName = (e) => {
        let val = e.target.value
        let valForSearch = val.toLowerCase().replace(/\s+/g, ' ').trim()
        setSearchByDelivererName(val)
        ;(searchedData.length > 0 || totalSearched > 0) &&
            dispatch(clearSearchedClients())
        if (valForSearch === '') {
            setData(clients)
            setFilteredDataTotal(total)
        } else {
            const filteredDeliverer = filter(clients, (client) => {
                return client.packman?.name.toLowerCase().includes(valForSearch)
            })
            setData(filteredDeliverer)
            setFilteredDataTotal(filteredDeliverer.length)
        }
    }

    const filterByNameWhenPressEnter = (e) => {
        if (e.key === 'Enter') {
            const body = {
                currentPage,
                countPage: showByTotal,
                search: {
                    client: searchByName.replace(/\s+/g, ' ').trim(),
                    packman: searchByDelivererName.replace(/\s+/g, ' ').trim(),
                },
            }
            dispatch(getClientsByFilter(body))
        }
    }

    const handleChangeOptions = (e) => {
        setPackman(e)
    }

    useEffect(() => {
        dispatch(getAllPackmans())
    }, [dispatch])

    useEffect(() => {
        const body = {
            currentPage,
            countPage: showByTotal,
            search: {
                client: searchByName.replace(/\s+/g, ' ').trim(),
                packman: searchByDelivererName.replace(/\s+/g, ' ').trim(),
            },
        }
        dispatch(getClients(body))
        //    eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, showByTotal, currentPage])
    useEffect(() => {
        setData(clients)
    }, [clients])
    useEffect(() => {
        setFilteredDataTotal(total)
    }, [total])
    useEffect(() => {
        setSearchedData(searchedClients)
    }, [searchedClients])
    useEffect(() => {
        const options = map(packmans, (packman) => {
            return {label: packman.name, value: packman._id}
        })
        setPackmanOptions(options)
    }, [packmans])
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
            <UniversalModal
                headerText={`${deletedCLients && deletedCLients.name} ${t(
                    'ismli mijozni o`chirishni tasdiqlaysizmi?'
                )}`}
                title={t('O`chirilgan mijozni tiklashning imkoni mavjud emas!')}
                toggleModal={toggleModal}
                body={modalBody}
                approveFunction={handleClickApproveToDelete}
                isOpen={modalVisible}
                printedSelling={printedSelling}
            />
            <form
                className={`flex gap-[1.25rem] bg-background flex-col mainPadding transition ease-linear duration-200 ${
                    stickyForm && 'stickyForm'
                }`}
            >
                <div className='supplier-style'>
                    <FieldContainer
                        value={clientName}
                        label={t('Mijoz ismi')}
                        placeholder={t('misol: Navro`z')}
                        maxWidth={'w-[21rem]'}
                        type={'string'}
                        onChange={handleChangeClientName}
                        border={true}
                    />
                    <FieldContainer
                        value={
                            currencyType === 'USD' ? prepayment : prepaymentUzs
                        }
                        label={'Oldindan tulov'}
                        placeholder={t('misol: 10000')}
                        type={'number'}
                        onChange={handleChangePrePayment}
                        border={true}
                    />
                    <FieldContainer
                        value={prepaymentType}
                        onChange={(e) => setPrepaymentType(e)}
                        label={t('Tulov turi')}
                        placeholder={t('misol: Naqd')}
                        select={true}
                        options={prePaymentTypes}
                    />
                </div>

                <div className='w-full flex justify-end'>
                    <div className={'flex gap-[1.25rem] w-[18.3125rem]'}>
                        <Button
                            add={!stickyForm}
                            edit={stickyForm}
                            text={
                                stickyForm
                                    ? t(`Saqlash`)
                                    : t('Yangi mijoz qo`shish')
                            }
                            onClick={stickyForm ? handleEdit : addNewClients}
                        />
                        <Button onClick={clearForm} text={t('Tozalash')} />
                    </div>
                </div>
            </form>

            <div className='pagination-supplier mainPadding'>
                <p className='supplier-title'>{t('Mijozlar')}</p>
                {(filteredDataTotal !== 0 || totalSearched !== 0) && (
                    <Pagination
                        countPage={Number(showByTotal)}
                        totalDatas={totalSearched || filteredDataTotal}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>
            <SearchForm
                filterBy={['total', 'delivererName', 'clientName']}
                filterByTotal={filterByTotal}
                filterByClientNameWhenPressEnter={filterByNameWhenPressEnter}
                filterByDelivererNameWhenPressEnter={filterByNameWhenPressEnter}
                searchByClientName={searchByName}
                searchByDelivererName={searchByDelivererName}
                filterByClientName={filterByClientName}
                filterByDelivererName={filterByDelivererName}
            />

            <div className='tableContainerPadding'>
                {loading ? (
                    <Spinner />
                ) : data.length === 0 && searchedData.length === 0 ? (
                    <NotFind text={t('Mijozlar mavjud emas')} />
                ) : (
                    <Table
                        data={searchedData.length > 0 ? searchedData : data}
                        page={'client'}
                        currentPage={currentPage}
                        countPage={showByTotal}
                        headers={headers}
                        Edit={handleEditClients}
                        Delete={handleDeleteClient}
                        Print={handlePrint}
                        currencyType={currencyType}
                    />
                )}
            </div>
        </motion.section>
    )
}

export default ClientsPage
