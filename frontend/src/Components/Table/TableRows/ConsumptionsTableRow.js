import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import { map } from 'lodash'
import { useLocation } from 'react-router-dom'
export const ConsumptionsTableRow = ({
    data,
    currentPage,
    countPage,
    currency,
    Delete,
    Edit,
    type,
}) => {

    const location = useLocation()

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
                    <td className='text-right td font-medium'>
                        {currency === 'USD'
                            ? income.totalprice.toLocaleString('ru-Ru')
                            : income.totalpriceuzs.toLocaleString('ru-Ru')}{' '}
                        <span>{currency}</span>
                    </td>
                    <td className='text-left td'>{income.incomeName?.name}</td>
                    <td className='text-left td'>{income?.comment}</td>
                    <td className='text-left py-[0.625rem] td'>
                        {typeofexpense(income.type)}
                    </td>
                    {!location.pathname.includes('/kassa/consumption') && <td className='border-r-0 py-[0.625rem] td'>
                        <div className='flex items-center justify-center gap-[0.625rem]'>
                            <TableBtn
                                type={'edit'}
                                bgcolor={'bg-warning-500'}
                                onClick={() => Edit(income)}
                            />
                            <TableBtn
                                type={'delete'}
                                bgcolor={'bg-error-500'}
                                onClick={() => Delete(income._id)}
                            />
                        </div>
                    </td>}
                </tr>
            ))}
        </>
    )
}
