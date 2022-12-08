import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import {map} from 'lodash'
import {universalToast} from '../../ToastMessages/ToastMessages'
import {roundUsd, roundUzs} from '../../../App/globalFunctions'
export const ClientTableRow = ({
    data,
    currentPage,
    countPage,
    Edit,
    Delete,
    Print,
    currencyType,
}) => {
    const type = (key) => {
        return currencyType === 'USD' ? key : key + 'uzs'
    }
    const getDebt = (sales) => {
        const totalprice =
            sales?.products.reduce(
                (prev, el) => prev + el[type('totalprice')] || 0,
                0
            ) || 0
        const payments =
            sales?.payments.reduce(
                (prev, el) => prev + el[type('payment')] || 0,
                0
            ) || 0
        const discounts =
            sales?.discounts.reduce(
                (prev, el) => prev + el[type('discount')] || 0,
                0
            ) || 0

        const debt = totalprice - discounts - payments

        return currencyType === 'USD' ? roundUsd(debt) : roundUzs(debt)
    }
    return (
        <>
            {map(data, (client, index) => (
                <tr className='tr' key={client._id}>
                    <td className='text-left td'>
                        {currentPage * countPage + index + 1}
                    </td>
                    <td className='text-left td'>{client.name}</td>
                    <td className='text-right td'>
                        {currencyType === 'USD'
                            ? roundUsd(client.prepayment || 0)
                            : roundUzs(client.prepaymentuzs || 0)}{' '}
                        {currencyType}
                    </td>
                    <td className='text-right td'>
                        {getDebt(client.saleconnector)} {currencyType}
                    </td>
                    <td className='border-r-0 td py-[0.375rem]'>
                        <div className='flex items-center justify-center gap-[0.625rem]'>
                            <TableBtn
                                type={'print'}
                                bgcolor={'bg-primary-800'}
                                onClick={() => {
                                    if (client.saleconnector) {
                                        Print(client?.saleconnector)
                                    } else {
                                        universalToast(
                                            'Mijozda sotuv bulmagan!',
                                            'warning'
                                        )
                                    }
                                }}
                            />
                            <TableBtn
                                type={'edit'}
                                bgcolor={'bg-warning-500'}
                                onClick={() => Edit(client)}
                            />
                            <TableBtn
                                type={'delete'}
                                bgcolor={'bg-error-500'}
                                onClick={() => Delete(client)}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}
