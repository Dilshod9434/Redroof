import {map, uniqueId} from 'lodash'
import React, {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {useReactToPrint} from 'react-to-print'
import PrintBtn from '../../Buttons/PrintBtn'
import SmallLoader from '../../Spinner/SmallLoader'

const ExpenseProductsCheck = ({products}) => {
    const {currencyType} = useSelector((state) => state.currency)

    const [loadContent, setLoadContent] = useState(false)
    const saleCheckRef = useRef(null)
    const onBeforeGetContentResolve = useRef(null)
    const handleOnBeforeGetContent = React.useCallback(() => {
        setLoadContent(true)
        return new Promise((resolve) => {
            onBeforeGetContentResolve.current = resolve

            setTimeout(() => {
                setLoadContent(false)
                resolve()
            }, 2000)
        })
    }, [setLoadContent])
    const reactToPrintContent = React.useCallback(() => {
        return saleCheckRef.current
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saleCheckRef.current])
    const print = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: 'All Checks',
        onBeforeGetContent: handleOnBeforeGetContent,
        removeAfterPrint: true,
    })
    useEffect(() => {
        if (
            loadContent &&
            typeof onBeforeGetContentResolve.current === 'function'
        ) {
            onBeforeGetContentResolve.current()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onBeforeGetContentResolve.current, loadContent])

    return (
        <section className='w-[27cm] mt-4 mx-auto'>
            {loadContent && (
                <div className='fixed backdrop-blur-[2px] left-0 right-0 bg-white-700 flex flex-col items-center justify-center w-full h-full'>
                    <SmallLoader />
                </div>
            )}
            <div ref={saleCheckRef} className='bg-white-900 p-4 rounded-md'>
                <table className='border-collapse border border-slate-400 w-full'>
                    <thead>
                        <tr>
                            <td className='check-table-rtr'>№</td>
                            <td className='check-table-rtr'>Sana</td>
                            <td className='check-table-rtr'>Kodi</td>
                            <td className='check-table-rtr'>Maxsulot</td>
                            <td className='check-table-rtr'>Soni</td>
                            <td className='check-table-rtr'>Narxi(dona)</td>
                        </tr>
                    </thead>
                    <tbody>
                        {map(products, (item, index) => {
                            return (
                                <tr key={uniqueId('selled-row')}>
                                    <td className='p-1 border text-center text-[0.875rem] font-bold'>
                                        {index + 1}
                                    </td>
                                    <td className='check-table-body'>
                                        {new Date(
                                            item?.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className='check-table-body text-center'>
                                        {item?.code}
                                    </td>
                                    <td className='check-table-body text-start'>
                                        {item?.name}
                                    </td>
                                    <td className='check-table-body'>
                                        {item?.total}
                                    </td>
                                    <td className='check-table-body'>
                                        {currencyType === 'USD'
                                            ? item?.price.toLocaleString(
                                                  'ru-Ru'
                                              )
                                            : item?.priceuzs.toLocaleString(
                                                  'ru-Ru'
                                              )}{' '}
                                        {currencyType}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className='flex justify-center items-center mt-6'>
                <PrintBtn onClick={print} isDisabled={loadContent} />
            </div>
        </section>
    )
}

export default ExpenseProductsCheck
