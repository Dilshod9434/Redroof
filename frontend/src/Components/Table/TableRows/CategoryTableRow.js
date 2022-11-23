import React from 'react'
import TableBtn from '../../Buttons/TableBtn'
import {map} from 'lodash'
import {useNavigate} from 'react-router-dom'

export const CategoryTableRow = ({
                                     data,
                                     currentPage,
                                     countPage,
                                     Edit,
                                     Delete
                                 }) => {
    const navigate = useNavigate()
    return (
        <>
            {map(data, (category, index) => (
                <tr key={category._id} className='tr'>
                    <td className='td'>
                        {currentPage * countPage + 1 + index}
                    </td>
                    <td className='td'>{category.code}</td>
                    <td className='td'>{category.name}</td>
                    <td className='td border-r-0 text-center max-w-[50px] py-[0.375rem]'>
                        <div className='flex items-center justify-center'>
                            <TableBtn
                                type={'report'}
                                bgcolor='bg-primary-800 mr-2.5'
                                onClick={() => navigate(category.code, {
                                    state: {
                                        id: category._id,
                                        name: category.name
                                    }
                                })}
                            />
                            <TableBtn
                                type={'edit'}
                                bgcolor='bg-warning-500'
                                onClick={() => Edit(category)}
                            />
                            <TableBtn
                                type={'delete'}
                                bgcolor='bg-error-500 ml-2.5'
                                onClick={() => Delete(category)}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}
