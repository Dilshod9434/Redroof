import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import {uniqueId, map} from 'lodash'

export const SellerTableRow = ({
    data,
    currentPage,
    countPage,
    Edit,
    linkToSellerReports,
}) => {
    return (
        <>
            {map(data,(seller, index) => (
                <tr className='tr' key={uniqueId('filial')}>
                    <td className='text-left td'>
                        {currentPage * countPage + index + 1}
                    </td>
                    <td className='text-right td'>{seller.firstname}</td>
                    <td className='text-left td'>{seller.lastname}</td>
                    <td className='text-right td'>{seller.phone}</td>
                    <td className='text-right td'>{seller.login}</td>
                    <td className='border-r-0 td py-[0.375rem]'>
                        <div className='flex items-center justify-center gap-[0.625rem]'>
                            <TableBtn
                                type={'edit'}
                                bgcolor={'bg-warning-500'}
                                onClick={() => Edit(seller)}
                            />
                            <TableBtn
                                type={'info'}
                                bgcolor={'bg-primary-800'}
                                onClick={() => linkToSellerReports(seller._id)}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}
