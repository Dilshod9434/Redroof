import {map} from 'lodash'
import React from 'react'
import {useSelector} from 'react-redux'
import {roundUsd, roundUzs} from '../../../App/globalFunctions'

const TableExcel = ({data, tableRef, current}) => {
    const {currencyType} = useSelector((state) => state.currency)

    const filterData = () => {
        let dataLength = data[0].dailyIncomes.length
        let count = 0
        let filteredData = []

        while (count < dataLength) {
            let obj = {
                incomes: [],
            }
            data.map((item) => {
                obj.createdAt = item.dailyIncomes[count].createdAt
                obj.incomes.push(item.dailyIncomes[count])
            })
            console.log('work')
            filteredData.push(obj)
            count++
        }

        return filteredData
    }

    const datas = filterData()
    console.log(datas)

    return (
        <div className='flex' ref={tableRef}>
            <table className='overflow-x-auto min-w-[100px]'>
                <thead className='rounded-t-lg sticky top-0'>
                    <tr className='bg-primary-900 rounded-t-lg'>
                        <th className='th'>
                            <div className='inline-flex items-center ml-1'>
                                Sana
                            </div>
                        </th>
                        {data.map((item, ind) => (
                            <th className='th' key={ind}>
                                <div className='inline-flex items-center ml-1'>
                                    {item?.name}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {datas &&
                        datas.map((item, ind) => (
                            <tr className='tr' key={ind}>
                                <td className='td py-[0.375rem]'>
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleDateString()}
                                </td>
                                {item.incomes.map((el, ind) => (
                                    <td className='td py-[0.375rem]' key={ind}>
                                        {currencyType === 'USD'
                                            ? el?.totalprice
                                            : el?.totalpriceuzs}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    <tr className='tr'>
                        <td className='td py-[0.375rem] min-w-[100px] font-bold text-success-500'>
                            Kirim:
                        </td>
                        <td className='td py-[0.375rem] pr-[1rem] font-medium'>
                            {currencyType === 'USD'
                                ? roundUsd(current?.currentIncomes)
                                : roundUzs(current?.currentIncomesUzs)}{' '}
                            {currencyType}
                        </td>
                    </tr>
                    <tr className='tr'>
                        <td className='td py-[0.375rem] min-w-[100px] font-bold text-error-500'>
                            Chiqim:
                        </td>
                        <td className='td py-[0.375rem] pr-[1rem] font-medium'>
                            {currencyType === 'USD'
                                ? roundUsd(current?.currentConsumptions)
                                : roundUzs(
                                      current?.currentConsumptionsUzs
                                  )}{' '}
                            {currencyType}
                        </td>
                    </tr>
                    <tr className='tr'>
                        <td className='td py-[0.375rem] min-w-[100px] font-bold text-blue-500'>
                            Qolgan:
                        </td>
                        <td className='td py-[0.375rem] pr-[1rem] font-medium'>
                            {currencyType === 'USD'
                                ? roundUsd(current?.balance)
                                : roundUzs(current?.balanceuzs)}{' '}
                            {currencyType}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default TableExcel
