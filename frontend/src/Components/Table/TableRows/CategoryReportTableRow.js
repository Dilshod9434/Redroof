import React from 'react'
import {map} from 'lodash'

export const CategoryReportTableRow = ({data}) => {
    return (
        <>
            {map(data, (product, index) => (
                <tr key={product._id} className='tr'>
                    <td className='td text-center p-2'>
                        {index + 1}
                    </td>
                    <td className='td text-center'>
                        {product.productdata.code}
                    </td>
                    <td className='td text-left'>{product.productdata.name}</td>
                    <td className='td text-right'>
                        {product.total.toLocaleString('ru-RU')}{' '}
                        {product.unit && product.unit.name}
                    </td>
                    <td className='td text-right'>
                        {product.price && product.price.incomingpriceuzs.toLocaleString(
                            'ru-RU'
                        )} UZS
                    </td>
                    <td className='td text-right'>
                        {product.price && product.price.incomingprice.toLocaleString(
                            'ru-RU'
                        )} USD
                    </td>
                    <td className='td text-right'>
                        {product.price && product.price.sellingpriceuzs.toLocaleString(
                            'ru-RU'
                        )} UZS
                    </td>
                    <td className='td text-right'>
                        {product.price && product.price.sellingprice.toLocaleString(
                            'ru-RU'
                        )} USD
                    </td>
                </tr>
            ))}
        </>
    )
}
