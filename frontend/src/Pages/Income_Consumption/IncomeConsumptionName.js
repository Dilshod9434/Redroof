import React, {useEffect, useState} from 'react'
import FieldContainer from '../../Components/FieldContainer/FieldContainer.js'
import Button from '../../Components/Buttons/BtnAddRemove.js'
import Table from '../../Components/Table/Table.js'
import {useDispatch, useSelector} from 'react-redux'
import {motion} from 'framer-motion'
import UniversalModal from '../../Components/Modal/UniversalModal.js'
import {universalToast} from '../../Components/ToastMessages/ToastMessages.js'
import {useTranslation} from 'react-i18next'
import {
    createIncomeName,
    getIncomeNames,
    updateIncomeName,
} from './incomeConsumptionSlice.js'

const IncomeConsumptionName = () => {
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()
    const {
        market: {_id},
    } = useSelector((state) => state.login)

    const {incomeNames} = useSelector((state) => state.income_consumption)

    const headers = [
        {title: '№', styles: 'w-[8%] text-left'},
        {title: 'Sana', styles: 'w-[17%] text-center'},
        {title: 'Nomi', styles: 'w-[67%] text-center'},
        {title: '', styles: 'w-[8%] text-center'},
    ]

    const [name, setName] = useState('')
    const [nameId, setNameId] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [stickyForm, setStickyForm] = useState(false)
    // const [modalBody, setModalBody] = useState(null)

    const handleChangeName = (e) => {
        setName(e.target.value)
    }

    const editName = (name) => {
        setName(name.name)
        setNameId(name._id)
        setStickyForm(true)
    }

    const handleCreateName = (e) => {
        e.preventDefault()
        if (!name) {
            return universalToast('Nomini kiriting!', 'warning')
        } else {
            dispatch(
                createIncomeName({
                    name: name,
                })
            ).then(({error}) => {
                if (!error) {
                    universalToast('Nomi yaratildi!', 'success')
                    clearForm()
                }
            })
        }
    }

    const handleEditName = (e) => {
        e.preventDefault()
        if (!name) {
            return universalToast('Nomini kiriting!', 'warning')
        } else {
            dispatch(
                updateIncomeName({
                    name: name,
                    _id: nameId,
                })
            ).then(({error}) => {
                if (!error) {
                    universalToast("Nomi o'zgarildi!", 'success')
                    clearForm()
                }
            })
        }
    }

    const clearForm = (e) => {
        e && e.preventDefault()
        setName('')
        setNameId(null)
        setStickyForm(false)
    }

    useEffect(() => {
        dispatch(getIncomeNames(_id))
    }, [dispatch, _id])

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
            {/* <UniversalModal
                headerText={''}
                title={''}
                toggleModal={() => {}}
                body={modalBody}
                approveFunction={
                    () => {}
                    // newExchange ? updateAllProducts : handleClickApproveToDelete
                }
                // closeModal={handleClickCancelToDelete}
                isOpen={modalVisible}
            /> */}
            <form
                className={`unitFormStyle ${
                    stickyForm && 'stickyForm'
                } flex gap-[1.25rem] bg-background flex-col mainPadding transition ease-linear duration-200`}
            >
                <div className='exchangerate-style'>
                    <FieldContainer
                        value={name}
                        onChange={handleChangeName}
                        label={'Nomi'}
                        placeholder={t('misol: 11 000 UZS')}
                        maxWidth={'w-[30.75rem]'}
                        border={true}
                        // onKeyPress={handleKeyUp}
                    />
                    <div
                        className={'w-full flex gap-[1.25rem] grow w-[33.2rem]'}
                    >
                        <Button
                            onClick={
                                stickyForm ? handleEditName : handleCreateName
                            }
                            add={!stickyForm}
                            edit={stickyForm}
                            text={
                                stickyForm
                                    ? t(`Saqlash`)
                                    : `Yangi nomni qo'shish`
                            }
                        />
                        <Button onClick={clearForm} text={t('Tozalash')} />
                    </div>
                </div>
            </form>

            <div className='tableContainerPadding'>
                {incomeNames && (
                    <Table
                        page={'incomeName'}
                        data={incomeNames}
                        headers={headers}
                        Edit={editName}
                        // Delete={handleDeleteExchange}
                    />
                )}
            </div>
        </motion.section>
    )
}

export default IncomeConsumptionName
