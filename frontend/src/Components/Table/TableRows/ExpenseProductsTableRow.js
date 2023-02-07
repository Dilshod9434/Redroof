import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import { map } from 'lodash'
import { roundUsd, roundUzs } from '../../../App/globalFunctions'
import { useSelector } from 'react-redux'

export const ExpenseProductTableRow = ({
    data,
    currentPage,
    countPage,
    Print,
    Delete,
}) => {
    const { currencyType } = useSelector((state) => state.currency)
    return (
        <>
            {map(data, (product, index) => (
                <tr className='tr' key={'absd' + index}>
                    <td className='text-left td'>
                        {currentPage * countPage + index + 1}
                    </td>
                    <td className='text-center td'>
                        {new Date(product?.createdAt).toLocaleDateString()}
                    </td>
                    <td className='text-right td'>{product?.count}</td>
                    <td className='text-right td'>
                        {currencyType === 'USD'
                            ? roundUsd(product?.totalprice)
                            : roundUzs(product?.totalpriceuzs)}{' '}
                        {currencyType}
                    </td>
                    <td className='border-r-0 td py-[0.375rem]'>
                        <div className='flex items-center justify-center gap-[0.625rem]'>
                            <TableBtn
                                type={'print'}
                                bgcolor={'bg-primary-800'}
                                onClick={() => Print(product.products)}
                            />
                            <TableBtn
                                type={'delete'}
                                bgcolor={'bg-error-500'}
                                onClick={() => Delete(product)}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}
