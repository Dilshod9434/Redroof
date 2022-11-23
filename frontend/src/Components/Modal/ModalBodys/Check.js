import React, {useEffect, useRef, useState} from 'react'
import PrintBtn from '../../Buttons/PrintBtn'
import {SaleCheck} from '../../SaleCheck/SaleCheck.js'
import {useReactToPrint} from 'react-to-print'
import SmallLoader from '../../Spinner/SmallLoader.js'
import {SaleCheckReturn} from '../../SaleCheck/SaleCheckReturn.js'
import {PaymentCheck} from '../../SaleCheck/PaymentCheck.js'
import {SaleCheckPos} from '../../SaleCheck/SaleCheckPos.js'
import {SaleCheckPosReturn} from '../../SaleCheck/SaleCheckPosReturn.js'
import {PaymentCheckPos} from '../../SaleCheck/PaymentCheckPos.js'
import {OrderCheck} from '../../OrdersCheck/OrderCheck.js'
import {OrderCheckPos} from '../../OrdersCheck/OrderCheckPos.js'

function Check({product, returned, isPayment, payment, isOrder, order}) {
    const [loadContent, setLoadContent] = useState(false)
    const saleCheckRef = useRef(null)
    const saleCheckRefPosPrinter = useRef(null)
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

    // const reactToPrintContentPosPrinter = React.useCallback(() => {
    //     return saleCheckRefPosPrinter.current
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [saleCheckRef.current])
    const print = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: 'Sale Check',
        onBeforeGetContent: handleOnBeforeGetContent,
        removeAfterPrint: true,
    })

    // const printPosPrinter = useReactToPrint({
    //     content: reactToPrintContentPosPrinter,
    //     documentTitle: 'Sale CheckPosPrinter',
    //     onBeforeGetContent: handleOnBeforeGetContent,
    //     removeAfterPrint: true,
    // })
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
        <section>
            <div className='w-[27cm] mt-4 mx-auto'>
                {loadContent && (
                    <div className='fixed backdrop-blur-[2px] left-0 top-0 bg-white-700 flex flex-col items-center justify-center w-full h-full'>
                        <SmallLoader />
                    </div>
                )}
                {returned ? (
                    <SaleCheckReturn product={product} ref={saleCheckRef} />
                ) : isPayment ? (
                    <PaymentCheck payment={payment} ref={saleCheckRef} />
                ) : isOrder ? (
                    <OrderCheck ref={saleCheckRef} order={order} />
                ) : (
                    <SaleCheck product={product} ref={saleCheckRef} />
                )}

                {returned ? (
                    <div className='hidden'>
                        <SaleCheckPosReturn
                            product={product}
                            ref={saleCheckRefPosPrinter}
                        />
                    </div>
                ) : isPayment ? (
                    <div className='hidden'>
                        <PaymentCheckPos
                            payment={payment}
                            ref={saleCheckRefPosPrinter}
                        />
                    </div>
                ) : isOrder ? (
                    <div className='hidden'>
                        <OrderCheckPos
                            ref={saleCheckRefPosPrinter}
                            order={order}
                        />
                    </div>
                ) : (
                    <div className='hidden'>
                        <SaleCheckPos
                            product={product}
                            ref={saleCheckRefPosPrinter}
                        />
                    </div>
                )}
            </div>
            <div className='w-[27cm] flex justify-between items-center mt-6'>
                <PrintBtn onClick={print} isDisabled={loadContent} />
                {/*<PrintBtn onClick={printPosPrinter} isDisabled={loadContent} />*/}
            </div>
        </section>
    )
}

export default Check
