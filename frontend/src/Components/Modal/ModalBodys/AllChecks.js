import React, {useEffect, useRef, useState} from 'react'
import PrintBtn from '../../Buttons/PrintBtn'
import {useReactToPrint} from 'react-to-print'
import {SaleCheckAll} from '../../SaleCheck/SaleCheckAll.js'
import SmallLoader from '../../Spinner/SmallLoader.js'
import {filter} from 'lodash'
function AllCheck({product}) {
    const [loadContent, setLoadContent] = useState(false)
    const [selled, setSelled] = useState([])
    const [returned, setReturned] = useState([])
    const [selledDiscounts, setSelledDiscounts] = useState([])
    const [returnedDiscounts, setReturnedDiscounts] = useState([])
    const [selledPayments, setSelledPayments] = useState([])
    const [returnedPayments, setReturnedPayments] = useState([])
    const [userInfo, setUserInfo] = useState({})
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
    useEffect(() => {
        setSelled(filter(product?.products, (item) => item.pieces > 0))
        setReturned(filter(product?.products, (item) => item.pieces < 0))
        setSelledDiscounts(
            filter(product?.discounts, (item) => item.discount > 0)
        )
        setReturnedDiscounts(
            filter(product?.discounts, (item) => item.discount < 0)
        )
        setSelledPayments(filter(product?.payments, (item) => item.payment > 0))
        setReturnedPayments(
            filter(product?.payments, (item) => item.payment < 0)
        )
        setUserInfo(product?.user)
    }, [product])

    return (
        <section className='w-[27cm] mt-4 mx-auto'>
            {loadContent && (
                <div className='fixed backdrop-blur-[2px] left-0 right-0 bg-white-700 flex flex-col items-center justify-center w-full h-full'>
                    <SmallLoader />
                </div>
            )}
            <SaleCheckAll
                ref={saleCheckRef}
                returned={returned}
                selled={selled}
                selledDiscounts={selledDiscounts}
                returnedDiscounts={returnedDiscounts}
                selledPayments={selledPayments}
                returnedPayments={returnedPayments}
                product={product}
                userInfo={userInfo}
            />
            <div className='flex justify-center items-center mt-6'>
                <PrintBtn onClick={print} isDisabled={loadContent} />
            </div>
        </section>
    )
}

export default AllCheck
