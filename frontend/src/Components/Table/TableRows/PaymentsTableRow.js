import {uniqueId,map} from 'lodash'
import React from 'react'

export const PaymentsTableRow = ({
                                     data,
                                     currentPage,
                                     countPage,
                                     currency,
                                     type
                                 }) => {
    return (
        <>
            {map(data,(sale, index) => (
                <tr className='tr' key={uniqueId('sale')}>
                    <td className='text-left td'>
                        {currentPage * countPage + 1 + index}
                    </td>
                    <td className='text-right td'>
                        {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className='text-right td'>{sale.id}</td>
                    <td className='text-left td'>
                        {sale?.client && sale.client?.name}
                    </td>
                    <td className='text-right td py-[0.625rem] font-bold'>
                        {currency === 'USD'
                            ? sale?.totalprice?.toLocaleString('ru-RU')
                            : sale?.totalpriceuzs?.toLocaleString('ru-RU')}{' '}
                        <span className='text-success-500'>{currency}</span>
                    </td>
                    <td className='text-right border-r-0 td font-bold'>
                        {currency === 'USD'
                            ? sale[type]?.toLocaleString('ru-RU')
                            : sale[type + 'uzs']?.toLocaleString('ru-RU')}{' '}
                        <span className='text-warning-500'>{currency}</span>
                    </td>
                </tr>
            ))}
        </>
    )
}
