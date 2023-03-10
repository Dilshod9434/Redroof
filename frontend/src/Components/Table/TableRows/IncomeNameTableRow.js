import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import { map } from 'lodash'

export const IncomeNameTableRow = ({ data, Edit, Delete }) => {
    return (
        <>
            {map(data, (incomeName, index) => (
                <tr className='tr' key={incomeName._id}>
                    <td className='text-left td'>{1 + index}</td>
                    <td className='text-left td'>
                        {new Date(incomeName.createdAt).toLocaleDateString()}
                    </td>
                    <td className='text-left td'>{incomeName?.name} </td>
                    <td className='border-r-0 td py-[0.375rem]'>
                        <div className='flex items-center justify-center gap-[0.625rem]'>
                            <TableBtn
                                type={'edit'}
                                bgcolor={'bg-warning-500'}
                                onClick={() => Edit(incomeName)}
                            />
                            <TableBtn
                                type={'delete'}
                                bgcolor={'bg-error-500'}
                                onClick={() => Delete(incomeName._id)}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}
