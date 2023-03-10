import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import { map } from 'lodash'
export const IncomesTableRow = ({
    data,
    currentPage,
    countPage,
    currency,
    Delete,
    Edit,
    type,
}) => {
    const typeofexpense = (moneyType) => {
        switch (moneyType) {
            case 'cash':
                return 'Naqt'
            case 'card':
                return 'Plastik'
            case 'transfer':
                return "O'tkazma"
            default:
                return ''
        }
    }

    return (
        <>
            {map(data, (income, index) => (
                <tr className='tr' key={income._id}>
                    <td className='text-left td'>
                        {currentPage * countPage + 1 + index}
                    </td>
                    <td className='text-right td'>
                        {new Date(income.createdAt).toLocaleDateString()}
                    </td>
                    <td className='text-left td py-2'>{income?.product?.productdata?.name}</td>
                    <td className='text-right td'>{income.pieces}</td>
                    <td className='text-right td'>{currency === 'USD' ? income.unitprice.toLocaleString('ru-RU') : income.unitpriceuzs.toLocaleString('ru-RU')}{' '}{currency}</td>
                    <td className='text-right td font-medium'>
                        {currency === 'USD'
                            ? income.totalprice.toLocaleString('ru-Ru')
                            : income.totalpriceuzs.toLocaleString('ru-Ru')}{' '}
                        <span>{currency}</span>
                    </td>
                </tr>
            ))}
        </>
    )
}
