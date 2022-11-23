import React, {forwardRef} from 'react'
import {useSelector} from 'react-redux'

export const PaymentCheckPos = forwardRef((props, ref) => {
    const {payment} = props
    const {user, market} = useSelector((state) => state.login)
    const {currencyType} = useSelector((state) => state.currency)
    return (
        <div
            ref={ref}
            className={
                'bg-white-900 p-4 rounded-md reciept w-full uppercase text-[7pt]'
            }
        >
            <div className='flex justify-between'>
                <span>Do'kon:</span>
                <span>{market.name}</span>
            </div>
            <div className='flex justify-between'>
                <span>Sotuvchi:</span>
                <span>
                    {user.firstname} {user.lastname}
                </span>
            </div>
            <div className='flex justify-between'>
                <span>Mijoz:</span>
                <span>
                    {payment?.saleconnector?.client?.name ||
                        payment?.saleconnector?.packman?.name ||
                        ''}
                </span>
            </div>
            <div className='flex justify-between'>
                <span>ID:</span>
                <span>{payment?.saleconnector?.id}</span>
            </div>

            <div className='flex justify-between'>
                <span>
                    Vaqt: {new Date(payment?.createdAt).toLocaleTimeString()}
                </span>
                <span>
                    Sana: {new Date(payment?.createdAt).toLocaleDateString()}
                </span>
            </div>
            <br />
            <hr className='text-opacity-50' />
            <br />
            <ul>
                <li className='flex justify-between text-[7pt] border-b border-b-black-300'>
                    Jami:{' '}
                    <span>
                        {currencyType === 'USD'
                            ? payment?.payment?.toLocaleString('ru-RU')
                            : payment?.paymentuzs?.toLocaleString('ru-RU')}{' '}
                        {currencyType}
                    </span>
                </li>
                <li className='flex justify-between text-[7pt] border-b border-b-black-300'>
                    To'lov turi:{' '}
                    <span>
                        {payment.type === 'cash'
                            ? 'Naqt'
                            : payment.type === 'card'
                            ? 'Plastik'
                            : payment.type === 'transfer'
                            ? "O'tkazma"
                            : 'Aralash'}
                    </span>
                </li>
            </ul>
        </div>
    )
})
