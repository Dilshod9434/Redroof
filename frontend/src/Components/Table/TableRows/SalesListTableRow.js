import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import {uniqueId, map} from 'lodash'
import {useNavigate} from 'react-router-dom'

export const SalesListTableRow = ({
    data,
    currentPage,
    countPage,
    currency,
    Print,
    sellers,
    addPlus,
}) => {
    const result = (prev, usd, uzs) => {
        return currency === 'USD' ? prev + usd : prev + uzs
    }

    const reduceEl = (arr, usd, uzs) => {
        return arr.reduce((prev, item) => {
            return result(prev, item[usd], item[uzs])
        }, 0)
    }

    const navigate = useNavigate()
    const linkToSale = (saleconnector, returnProducts) => {
        navigate('/sotuv/sotish', {
            replace: true,
            state: {saleconnector, returnProducts},
        })
    }

    return (
        <>
            {map(data, (saleconnector, index) => (
                <tr className='tr' key={uniqueId('sales')}>
                    <td className='text-left td'>
                        {currentPage * countPage + 1 + index}
                    </td>
                    <td className='td '>
                        <div className='flex justify-between'>
                            <span>
                                {new Date(
                                    saleconnector.createdAt
                                ).toLocaleDateString()}
                            </span>
                            <span>
                                {new Date(
                                    saleconnector.createdAt
                                ).toLocaleTimeString()}{' '}
                            </span>
                        </div>
                    </td>
                    <td className='text-left td'>{saleconnector.id}</td>
                    <td className='text-left td'>
                        {saleconnector?.client?.name ? (
                            <div className='flex justify-between items-center'>
                                <span> {saleconnector?.client?.name}</span>
                                <TableBtn
                                    type={'edit'}
                                    bgcolor={'bg-success-500'}
                                    onClick={() => addPlus(saleconnector._id)}
                                />
                            </div>
                        ) : (
                            <div className='flex justify-center items-center'>
                                <TableBtn
                                    type={'add'}
                                    bgcolor={'bg-success-500'}
                                    onClick={() => addPlus(saleconnector._id)}
                                />
                            </div>
                        )}
                    </td>
                    <td className='text-success-500 text-right td'>
                        {reduceEl(
                            saleconnector.products,
                            'totalprice',
                            'totalpriceuzs'
                        ).toLocaleString('ru-Ru')}{' '}
                        {currency}
                    </td>
                    <td className='text-warning-500 text-right td'>
                        {reduceEl(
                            saleconnector.discounts,
                            'discount',
                            'discountuzs'
                        ).toLocaleString('ru-Ru')}{' '}
                        {currency}
                    </td>
                    <td className='text-error-500 text-right td'>
                        {(
                            reduceEl(
                                saleconnector.products,
                                'totalprice',
                                'totalpriceuzs'
                            ) -
                            reduceEl(
                                saleconnector.payments,
                                'payment',
                                'paymentuzs'
                            ) -
                            reduceEl(
                                saleconnector.discounts,
                                'discount',
                                'discountuzs'
                            )
                        ).toLocaleString('ru-Ru')}{' '}
                        {currency}
                    </td>
                    <td className='text-left td py-[1rem] '>
                        {map(
                            saleconnector.dailyconnectors,
                            (connector, index) => {
                                if (connector.comment) {
                                    return (
                                        <p key={uniqueId('sale-list-table')}>
                                            {connector.comment}
                                        </p>
                                    )
                                }
                                return ''
                            }
                        )}
                    </td>

                    <td className='py-[0.375rem] td border-r-0'>
                        {sellers ? (
                            <div className='flex items-center justify-center gap-[0.625rem]'>
                                <TableBtn
                                    type={'print'}
                                    bgcolor={'bg-primary-800'}
                                    onClick={() => Print(saleconnector)}
                                />
                            </div>
                        ) : (
                            <div className='flex items-center justify-center gap-[0.625rem]'>
                                <TableBtn
                                    type={'print'}
                                    bgcolor={'bg-primary-800'}
                                    onClick={() => Print(saleconnector)}
                                />
                                <TableBtn
                                    type={'add'}
                                    bgcolor={'bg-success-500'}
                                    onClick={() => linkToSale(saleconnector)}
                                />
                                <TableBtn
                                    type={'return'}
                                    bgcolor={'bg-error-500'}
                                    onClick={() =>
                                        linkToSale(saleconnector, true)
                                    }
                                />
                            </div>
                        )}
                    </td>
                </tr>
            ))}
        </>
    )
}
